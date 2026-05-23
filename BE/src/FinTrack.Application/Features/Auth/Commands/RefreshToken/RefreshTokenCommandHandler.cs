using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using FinTrack.Application.Features.Auth.DTOs;
using FinTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using RefreshTokenEntity = FinTrack.Domain.Entities.RefreshToken;

namespace FinTrack.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : ICommandHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> HandleAsync(RefreshTokenCommand command, CancellationToken cancellationToken = default)
    {
        var existing = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == command.RefreshToken, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (!existing.IsActive)
            throw new UnauthorizedAccessException("Refresh token is expired or revoked.");

        existing.Revoke();

        var (newTokenValue, newTokenExpiry) = _jwtTokenService.GenerateRefreshToken();
        _context.RefreshTokens.Add(new RefreshTokenEntity(newTokenValue, existing.UserId, newTokenExpiry));
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(existing.User);
        return new AuthResponseDto(accessToken, newTokenValue, existing.User.Email, existing.User.DisplayName);
    }
}
