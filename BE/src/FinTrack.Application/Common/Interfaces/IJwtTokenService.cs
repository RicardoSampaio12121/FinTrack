using FinTrack.Domain.Entities;

namespace FinTrack.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    (string token, DateTime expiresAt) GenerateRefreshToken();
}
