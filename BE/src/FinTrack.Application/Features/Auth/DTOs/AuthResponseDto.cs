namespace FinTrack.Application.Features.Auth.DTOs;

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    string Email,
    string DisplayName);
