FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore trước (cache layer) rồi mới copy code
COPY DigiTalent.sln ./
COPY src/DigiTalent.Api/*.csproj src/DigiTalent.Api/
COPY src/DigiTalent.Application/*.csproj src/DigiTalent.Application/
COPY src/DigiTalent.Domain/*.csproj src/DigiTalent.Domain/
COPY src/DigiTalent.Infrastructure/*.csproj src/DigiTalent.Infrastructure/
RUN dotnet restore src/DigiTalent.Api/DigiTalent.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/DigiTalent.Api/DigiTalent.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
# FFmpeg dựng video ngôn ngữ ký hiệu (ghép video người thật ra dấu, H.264 + AAC): SignVideo:FfmpegPath / FfprobePath
# mặc định tìm "ffmpeg" / "ffprobe" trên PATH. Thiếu FFmpeg thì tính năng báo SIGN_RENDERER_NOT_CONFIGURED.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DigiTalent.Api.dll"]
