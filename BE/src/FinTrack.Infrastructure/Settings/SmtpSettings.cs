namespace FinTrack.Infrastructure.Settings;

public class SmtpSettings
{
    public string Host { get; init; } = default!;
    public int Port { get; init; }
    public string? Username { get; init; }
    public string? Password { get; init; }
    public string FromEmail { get; init; } = default!;
    public string FromName { get; init; } = default!;
}
