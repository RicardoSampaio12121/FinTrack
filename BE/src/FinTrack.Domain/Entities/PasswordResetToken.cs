using FinTrack.Domain.Common;

namespace FinTrack.Domain.Entities;

public class PasswordResetToken : BaseEntity
{
    public string Token { get; private set; } = default!;
    public Guid UserId { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }

    public User User { get; private set; } = default!;

    public bool IsValid => UsedAt is null && ExpiresAt > DateTime.UtcNow;

    private PasswordResetToken() { }

    public PasswordResetToken(string token, Guid userId, DateTime expiresAt)
    {
        Token = token;
        UserId = userId;
        ExpiresAt = expiresAt;
    }

    public void MarkUsed() => UsedAt = DateTime.UtcNow;
}
