FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /src

COPY DigiTalent.sln ./
RUN mkdir -p src/DigiTalent.Api src/DigiTalent.Application src/DigiTalent.Domain src/DigiTalent.Infrastructure src/DigiTalent.Shared
COPY src/DigiTalent.Api/*.csproj src/DigiTalent.Api/
COPY src/DigiTalent.Application/*.csproj src/DigiTalent.Application/
COPY src/DigiTalent.Domain/*.csproj src/DigiTalent.Domain/
COPY src/DigiTalent.Infrastructure/*.csproj src/DigiTalent.Infrastructure/
COPY src/DigiTalent.Shared/*.csproj src/DigiTalent.Shared/
RUN dotnet restore

COPY src/ ./src/
RUN dotnet publish src/DigiTalent.Api/DigiTalent.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DigiTalent.Api.dll"]
