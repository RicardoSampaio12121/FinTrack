using FinTrack.Domain.Common;

namespace FinTrack.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string DisplayName { get; private set; } = default!;

    public ICollection<RefreshToken> RefreshTokens { get; private set; } = [];
    public ICollection<PasswordResetToken> PasswordResetTokens { get; private set; } = [];

    private User() { }

    public User(string email, string passwordHash, string displayName)
    {
        Email = email.ToLowerInvariant();
        PasswordHash = passwordHash;
        DisplayName = displayName;
    }
}
