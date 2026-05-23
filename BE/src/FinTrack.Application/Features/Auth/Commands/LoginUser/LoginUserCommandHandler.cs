using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using FinTrack.Application.Features.Auth.DTOs;
using FinTrack.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RefreshTokenEntity = FinTrack.Domain.Entities.RefreshToken;

namespace FinTrack.Application.Features.Auth.Commands.LoginUser;

public class LoginUserCommandHandler : ICommandHandler<LoginUserCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IValidator<LoginUserCommand> _validator;

    public LoginUserCommandHandler(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IValidator<LoginUserCommand> validator)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _validator = validator;
    }

    public async Task<AuthResponseDto> HandleAsync(LoginUserCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == command.Email.ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var activeTokens = await _context.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
            token.Revoke();

        var (refreshTokenValue, refreshTokenExpiry) = _jwtTokenService.GenerateRefreshToken();
        _context.RefreshTokens.Add(new RefreshTokenEntity(refreshTokenValue, user.Id, refreshTokenExpiry));
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        return new AuthResponseDto(accessToken, refreshTokenValue, user.Email, user.DisplayName);
    }
}
