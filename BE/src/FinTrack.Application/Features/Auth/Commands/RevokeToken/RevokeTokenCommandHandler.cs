using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Application.Features.Auth.Commands.RevokeToken;

public class RevokeTokenCommandHandler : ICommandHandler<RevokeTokenCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RevokeTokenCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<bool> HandleAsync(RevokeTokenCommand command, CancellationToken cancellationToken = default)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == command.RefreshToken, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (!token.IsActive)
            throw new UnauthorizedAccessException("Refresh token is already expired or revoked.");

        token.Revoke();
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
