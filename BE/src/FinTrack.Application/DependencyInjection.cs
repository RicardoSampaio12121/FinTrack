using System.Reflection;
using FinTrack.Application.Common;
using FinTrack.Application.Features.Auth.DTOs;
using FinTrack.Application.Features.Auth.Commands.RegisterUser;
using FinTrack.Application.Features.Auth.Commands.LoginUser;
using FinTrack.Application.Features.Auth.Commands.RefreshToken;
using FinTrack.Application.Features.Auth.Commands.RevokeToken;
using FinTrack.Application.Features.Auth.Commands.ForgotPassword;
using FinTrack.Application.Features.Auth.Commands.ResetPassword;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace FinTrack.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<ICommandHandler<RegisterUserCommand, AuthResponseDto>, RegisterUserCommandHandler>();
        services.AddScoped<ICommandHandler<LoginUserCommand, AuthResponseDto>, LoginUserCommandHandler>();
        services.AddScoped<ICommandHandler<RefreshTokenCommand, AuthResponseDto>, RefreshTokenCommandHandler>();
        services.AddScoped<ICommandHandler<RevokeTokenCommand, bool>, RevokeTokenCommandHandler>();
        services.AddScoped<ICommandHandler<ForgotPasswordCommand, bool>, ForgotPasswordCommandHandler>();
        services.AddScoped<ICommandHandler<ResetPasswordCommand, bool>, ResetPasswordCommandHandler>();

        return services;
    }
}
