using FinTrack.Application.Common;
using FinTrack.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : ICommandHandler<ResetPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<ResetPasswordCommand> _validator;

    public ResetPasswordCommandHandler(
        IApplicationDbContext context,
        IValidator<ResetPasswordCommand> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<bool> HandleAsync(ResetPasswordCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == command.Token, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired password reset token.");

        if (!resetToken.IsValid)
            throw new UnauthorizedAccessException("Invalid or expired password reset token.");

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.NewPassword);
        resetToken.MarkUsed();

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
