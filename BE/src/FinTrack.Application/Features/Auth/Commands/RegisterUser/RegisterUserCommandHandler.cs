using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using FinTrack.Application.Features.Auth.DTOs;
using FinTrack.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RefreshTokenEntity = FinTrack.Domain.Entities.RefreshToken;

namespace FinTrack.Application.Features.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler : ICommandHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IValidator<RegisterUserCommand> _validator;

    public RegisterUserCommandHandler(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IValidator<RegisterUserCommand> validator)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _validator = validator;
    }

    public async Task<AuthResponseDto> HandleAsync(RegisterUserCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var exists = await _context.Users
            .AnyAsync(u => u.Email == command.Email.ToLowerInvariant(), cancellationToken);

        if (exists)
            throw new InvalidOperationException("A user with this email already exists.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(command.Password);
        var user = new User(command.Email, passwordHash, command.DisplayName);

        _context.Users.Add(user);

        var (refreshTokenValue, refreshTokenExpiry) = _jwtTokenService.GenerateRefreshToken();
        _context.RefreshTokens.Add(new RefreshTokenEntity(refreshTokenValue, user.Id, refreshTokenExpiry));

        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        return new AuthResponseDto(accessToken, refreshTokenValue, user.Email, user.DisplayName);
    }
}
