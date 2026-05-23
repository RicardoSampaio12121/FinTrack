namespace FinTrack.Application.Features.Auth.Commands.RegisterUser;

public record RegisterUserCommand(string Email, string Password, string DisplayName);
