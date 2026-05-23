using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using FinTrack.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : ICommandHandler<ForgotPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IValidator<ForgotPasswordCommand> _validator;
    private readonly IAppSettings _appSettings;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IValidator<ForgotPasswordCommand> validator,
        IAppSettings appSettings)
    {
        _context = context;
        _emailService = emailService;
        _validator = validator;
        _appSettings = appSettings;
    }

    public async Task<bool> HandleAsync(ForgotPasswordCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == command.Email.ToLowerInvariant(), cancellationToken);

        // Always return true to prevent email enumeration
        if (user is null)
            return true;

        var token = Guid.NewGuid().ToString("N");
        _context.PasswordResetTokens.Add(new PasswordResetToken(token, user.Id, DateTime.UtcNow.AddMinutes(30)));
        await _context.SaveChangesAsync(cancellationToken);

        var resetLink = $"{_appSettings.BaseUrl}/reset-password?token={token}";
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink, cancellationToken);
        return true;
    }
}
