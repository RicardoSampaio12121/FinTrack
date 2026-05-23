using FinTrack.Application.Common;
using FinTrack.Application.Features.Auth.Commands.ForgotPassword;
using FinTrack.Application.Features.Auth.Commands.LoginUser;
using FinTrack.Application.Features.Auth.Commands.RefreshToken;
using FinTrack.Application.Features.Auth.Commands.RegisterUser;
using FinTrack.Application.Features.Auth.Commands.ResetPassword;
using FinTrack.Application.Features.Auth.Commands.RevokeToken;
using FinTrack.Application.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ICommandHandler<RegisterUserCommand, AuthResponseDto> _register;
    private readonly ICommandHandler<LoginUserCommand, AuthResponseDto> _login;
    private readonly ICommandHandler<RefreshTokenCommand, AuthResponseDto> _refresh;
    private readonly ICommandHandler<RevokeTokenCommand, bool> _revoke;
    private readonly ICommandHandler<ForgotPasswordCommand, bool> _forgotPassword;
    private readonly ICommandHandler<ResetPasswordCommand, bool> _resetPassword;

    public AuthController(
        ICommandHandler<RegisterUserCommand, AuthResponseDto> register,
        ICommandHandler<LoginUserCommand, AuthResponseDto> login,
        ICommandHandler<RefreshTokenCommand, AuthResponseDto> refresh,
        ICommandHandler<RevokeTokenCommand, bool> revoke,
        ICommandHandler<ForgotPasswordCommand, bool> forgotPassword,
        ICommandHandler<ResetPasswordCommand, bool> resetPassword)
    {
        _register = register;
        _login = login;
        _refresh = refresh;
        _revoke = revoke;
        _forgotPassword = forgotPassword;
        _resetPassword = resetPassword;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken ct)
        => Ok(await _register.HandleAsync(command, ct));

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command, CancellationToken ct)
        => Ok(await _login.HandleAsync(command, ct));

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenCommand command, CancellationToken ct)
        => Ok(await _refresh.HandleAsync(command, ct));

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RevokeTokenCommand command, CancellationToken ct)
    {
        await _revoke.HandleAsync(command, ct);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        await _forgotPassword.HandleAsync(command, ct);
        return Ok(new { message = "If that email is registered, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        await _resetPassword.HandleAsync(command, ct);
        return Ok(new { message = "Password has been reset successfully." });
    }
}
