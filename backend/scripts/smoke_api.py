"""Run a live API smoke flow against the disposable PostgreSQL test database."""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:5180"


def request(path, method="GET", payload=None, token=None):
    body = json.dumps(payload).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = Request(BASE_URL + path, data=body, headers=headers, method=method)
    try:
        response = urlopen(req, timeout=10)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read()
        return response.status, json.loads(raw) if raw else None


def require_status(path, expected, method="GET", payload=None, token=None):
    status, result = request(path, method, payload, token)
    if status != expected:
        raise AssertionError(f"{method} {path}: expected HTTP {expected}, got {status}: {result}")
    return result


def wait_for_health(process):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("API exited before /health became ready")
        try:
            require_status("/health", 200)
            return
        except (URLError, TimeoutError):
            time.sleep(0.5)
    raise TimeoutError("API did not become healthy within 60 seconds")


def login(email, password):
    result = require_status(
        "/api/v1/auth/login", 200, "POST", {"email": email, "password": password}
    )
    return result["data"]["accessToken"]


def main():
    connection = os.environ["DIGITALENT_TEST_POSTGRES_CONNECTION"]
    password = os.environ["DIGITALENT_SMOKE_ADMIN_PASSWORD"]
    if "database=digitalent_test" not in connection.lower():
        raise RuntimeError("Smoke test requires the disposable digitalent_test database")

    env = os.environ.copy()
    env.update(
        ASPNETCORE_ENVIRONMENT="Development",
        ASPNETCORE_URLS=BASE_URL,
        ConnectionStrings__DefaultConnection=connection,
        DevelopmentSeed__Password=password,
    )
    dll = ROOT / "src/DigiTalent.Api/bin/Release/net8.0/DigiTalent.Api.dll"
    with tempfile.TemporaryFile(mode="w+t") as log:
        process = subprocess.Popen(["dotnet", str(dll)], cwd=ROOT, env=env, stdout=log, stderr=log)
        try:
            wait_for_health(process)
            login("admin@digitalent.ai", password)
            owner = login("owner@digitalent.ai", password)
            employee = login("employee@digitalent.ai", password)

            suffix = uuid4().hex[:8].upper()
            families = require_status("/api/v1/job-families", 200, token=owner)["data"]["items"]
            office_family = next((item for item in families if item.get("code") == "OFFICE"), families[0])
            require_status(f"/api/v1/job-families/{office_family['id']}", 409, "DELETE", token=owner)

            family = require_status(
                "/api/v1/job-families", 200, "POST",
                {"code": f"SMK-F-{suffix}", "name": "Smoke Family"}, owner,
            )["data"]
            require_status(f"/api/v1/job-families/{family['id']}", 200, "DELETE", token=owner)

            employees = require_status("/api/v1/employees?pageSize=20", 200, token=owner)["data"]["items"]
            candidate = next(
                (item for item in employees if item.get("employeeCode") == "EMP-0002"),
                employees[0],
            )
            department = require_status(
                "/api/v1/departments", 200, "POST",
                {"code": f"SMK-D-{suffix}", "name": "Smoke Department", "managerEmployeeId": candidate["id"]}, owner,
            )["data"]
            require_status(f"/api/v1/departments/{department['id']}", 409, "DELETE", token=owner)
            require_status(
                "/api/v1/departments", 403, "POST",
                {"code": f"DENY-{suffix}", "name": "Not Allowed"}, employee,
            )
            print("Live API smoke passed: health, login, job architecture conflict, department lifecycle, employee permission")
        except Exception:
            log.seek(0)
            print(log.read()[-4000:].replace(password, "[REDACTED]"))
            raise
        finally:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)


if __name__ == "__main__":
    main()
