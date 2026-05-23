using FinTrack.Application.Common.Interfaces;

namespace FinTrack.Infrastructure.Settings;

public class AppSettings : IAppSettings
{
    public string BaseUrl { get; init; } = "http://localhost:5173";
}
