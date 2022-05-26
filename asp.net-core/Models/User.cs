using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BMU.Models
{
    public enum UserRole
    {
        Customer = 0,
        Driver = 1,
        Admin = 2
    }

    [Table("User")]
    public class User : SetEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool HasProfilePicture { get; set; } = false;
        public UserRole Role { get; set; } = default;
        public string Password { get; set; } = string.Empty;
    }

    public class SimpleUserDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? ProfilePictureFileUrl { get; set; }
        public UserRole? Role { get; set; }
    }

    public class NameOnlyUserDto
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
    }

    public class LoginUserDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class RegisterUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? ProfilePictureFileBase64 { get; set; }
        public string? Password { get; set; }
        public UserRole? Role { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? ProfilePictureFileBase64 { get; set; }
        public bool RemoveProfilePicture { get; set; } = false;
        public bool UpdatePassword { get; set; } = false;
        public string? Password { get; set; }
        public string? NewPassword { get; set; }
        public UserRole? Role { get; set; }
    }
}
