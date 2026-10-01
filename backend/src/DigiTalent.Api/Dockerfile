FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore trước (cache layer) rồi mới copy code
COPY DigiTalent.sln ./
COPY src/DigiTalent.Api/*.csproj src/DigiTalent.Api/
COPY src/DigiTalent.Application/*.csproj src/DigiTalent.Application/
COPY src/DigiTalent.Domain/*.csproj src/DigiTalent.Domain/
COPY src/DigiTalent.Infrastructure/*.csproj src/DigiTalent.Infrastructure/
RUN dotnet restore

COPY src/ ./src/
RUN dotnet publish src/DigiTalent.Api/DigiTalent.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DigiTalent.Api.dll"]
