using System.Threading.Tasks;
using BCryptNet = BCrypt.Net.BCrypt;
using BMU.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BMU.Controllers
{
    [ApiController]
    [Route("Users")]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DataBlobContainer _blobContainer;

        public UserController(
            DataContext context,
            DataBlobContainer blobContainer)
        {
            _context = context;
            _blobContainer = blobContainer;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> RegisterAsync(RegisterUserDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.Name) && !string.IsNullOrWhiteSpace(data.Email) && !string.IsNullOrWhiteSpace(data.Password))
            {
                // Check if email is registered
                if (await _context.User.GetAsync(data.Email) == null)
                {
                    // Create a new user entity
                    var user = new User
                    {
                        Name = data.Name,
                        Email = data.Email,
                        // Hash password using Bcrypt
                        Password = BCryptNet.HashPassword(data.Password)
                    };
                    // Check if a profile picture is to be uploaded
                    if (data.ProfilePictureFileBase64 != null)
                    {
                        using (var stream = new MemoryStream(Convert.FromBase64String(data.ProfilePictureFileBase64)))
                        {
                            // Upload profile picture to blob storage
                            await _blobContainer.ProfilePicture.UploadAsync(user.Id.ToString(), stream);
                        }
                        user.HasProfilePicture = true;
                    }
                    // Check if new user is admin or driver
                    if (data.Role == UserRole.Admin || data.Role == UserRole.Driver)
                    {
                        // Check if request user is admin
                        var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                        if (requestUser != null)
                        {
                            if (requestUser.Role == UserRole.Admin)
                            {
                                // Assign new user with the role
                                user.Role = data.Role.Value;
                            }
                            else
                            {
                                // Return error message
                                return Unauthorized("Only admin can create an admin or driver account");
                            }
                        }
                        else
                        {
                            // Return error message
                            return NotFound("User is not found");
                        }
                    }
                    else
                    {
                        // Set default user role
                        user.Role = UserRole.Customer;
                    }
                    // Save new user to database
                    await _context.User.CreateAsync(_context, user);
                    // Return some user details only (eg. password is not returned)
                    return Ok(new SimpleUserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        ProfilePictureFileUrl = user.HasProfilePicture ? $"{_blobContainer.ProfilePicture.Uri.AbsoluteUri}/{user.Id}" : null,
                        Role = user.Role
                    });
                }
                // Return error message
                return Conflict("Email is registered");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpPost("Login")]
        public async Task<IActionResult> LoginAsync(LoginUserDto data)
        {
            if (!string.IsNullOrWhiteSpace(data.Email) && !string.IsNullOrWhiteSpace(data.Password))
            {
                // Get user from database
                var user = await _context.User.GetAsync(data.Email);
                // Check if user exists and verify password
                if (user != null && BCryptNet.Verify(data.Password, user.Password))
                {
                    // Return some user details only (eg. password is not returned)
                    return Ok(new SimpleUserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        ProfilePictureFileUrl = user.HasProfilePicture ? $"{_blobContainer.ProfilePicture.Uri.AbsoluteUri}/{user.Id}" : null,
                        Role = user.Role
                    });
                }
                // Return error message
                return Unauthorized("Incorrect email or password");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] bool? namesOnly, [FromQuery] bool? includeDeleted)
        {
            // Check if request user is admin
            if (await Utils.IsAdminFromHeaderAsync(Request.Headers, _context))
            {
                // Get users from database
                List<User> users;
                if (includeDeleted.HasValue && includeDeleted.Value)
                {
                    users = await _context.User.ToListAsync();
                }
                else
                {
                    users = await _context.User.GetAllAsync();
                }

                if (namesOnly.HasValue && namesOnly.Value)
                {
                    var namesOnlyUsers = users.Select(user => new NameOnlyUserDto
                    {
                        Id = user.Id,
                        Name = user.Name
                    });
                    // Return users
                    return Ok(namesOnlyUsers);
                }
                else
                {
                    // Return some user details only (eg. password is not returned)
                    var simpleUsers = users.Select(user => new SimpleUserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        ProfilePictureFileUrl = user.HasProfilePicture ? $"{_blobContainer.ProfilePicture.Uri.AbsoluteUri}/{user.Id}" : null,
                        Role = user.Role
                    });
                    // Return users
                    return Ok(simpleUsers);
                }
            }
            // Return error message
            return Unauthorized("Only admin can view users");
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetAsync(string email)
        {
            // Get request user and user from database
            var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
            var user = await _context.User.GetAsync(email);
            if (user != null && requestUser != null)
            {
                // Check if requested user is the same with get user or if requested user is admin
                if (user.Id == requestUser.Id || requestUser.Role == UserRole.Admin)
                {
                    // Return user
                    return Ok(new SimpleUserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        ProfilePictureFileUrl = user.HasProfilePicture ? $"{_blobContainer.ProfilePicture.Uri.AbsoluteUri}/{user.Id}" : null,
                        Role = user.Role
                    });
                }
                // Return error message
                return Unauthorized("User is not authorised");
            }
            // Return error message
            return NotFound("User is not found");
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync(UpdateUserDto data)
        {
            // Get user from database
            var user = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
            if (user != null)
            {
                return await UpdateUserAsync(user, data, user.Role == UserRole.Admin);
            }
            // Return error message
            return NotFound("User is not found");
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAsync(Guid id, UpdateUserDto data)
        {
            if (id != default)
            {
                // Get request user and deleted user from database
                var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                var user = await _context.User.GetAsync(id);
                if (user != null && requestUser != null)
                {
                    // Check if requested user is the same with updated user or if requested user is admin
                    if (user.Id == requestUser.Id || requestUser.Role == UserRole.Admin)
                    {
                        return await UpdateUserAsync(user, data, requestUser.Role == UserRole.Admin);
                    }
                    // Return error message
                    return Unauthorized("User is not authorised");
                }
                // Return error message
                return NotFound("User is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAsync()
        {
            // Get user from database
            var user = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
            if (user != null)
            {
                // Delete user from database
                await Task.WhenAll(
                    _context.User.DeleteAsync(_context, user),
                    _blobContainer.ProfilePicture.DeleteAsync(user.Id.ToString())
                );
                // Return message
                return Ok("User is deleted");
            }
            // Return error message
            return NotFound("User is not found");
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            if (id != default)
            {
                // Get request user and deleted user from database
                var requestUser = await Utils.GetRequestUserFromHeaderAsync(Request.Headers, _context);
                var user = await _context.User.GetAsync(id);
                if (requestUser != null && user != null)
                {
                    // Check if requested user is the same with deleted user or requested user is admin but admin cannot delete other admin
                    if (user.Id == requestUser.Id || (requestUser.Role == UserRole.Admin && user.Role != UserRole.Admin))
                    {
                        // Delete user from database
                        await Task.WhenAll(
                            _context.User.DeleteAsync(_context, user),
                            _blobContainer.ProfilePicture.DeleteAsync(user.Id.ToString())
                        );
                        // Return message
                        return Ok("User is deleted");
                    }
                    // Return error message
                    return Unauthorized("Admin cannot delete other admins");
                }
                // Return error message
                return NotFound("User is not found");
            }
            // Return error message
            return BadRequest("Data is invalid");
        }

        private async Task<IActionResult> UpdateUserAsync(User user, UpdateUserDto data, bool admin = false)
        {
            var update = false;
            if (!string.IsNullOrWhiteSpace(data.Name) && user.Name != data.Name)
            {
                user.Name = data.Name;
                update = true;
            }
            if (!string.IsNullOrWhiteSpace(data.Email) && user.Email != data.Email)
            {
                // Check if email is registered
                if (await _context.User.GetAsync(data.Email) == null)
                {
                    user.Email = data.Email;
                    update = true;
                }
                else
                {
                    // Return error message
                    return Conflict("Email is registered");
                }
            }
            // Check if a profile picture is to be uploaded
            if (data.ProfilePictureFileBase64 != null)
            {
                using (var stream = new MemoryStream(Convert.FromBase64String(data.ProfilePictureFileBase64)))
                {
                    // Upload profile picture to blob storage
                    await _blobContainer.ProfilePicture.UploadAsync(user.Id.ToString(), stream);
                }
                user.HasProfilePicture = true;
                update = true;
            }
            // Check if profile picture should be deleted
            if (data.RemoveProfilePicture)
            {
                // Delete profile picture from blob storage
                await _blobContainer.ProfilePicture.DeleteAsync(user.Id.ToString());
                user.HasProfilePicture = false; 
                update = true;
            }
            // Check if user is updating password
            if (data.UpdatePassword)
            {
                if (!string.IsNullOrWhiteSpace(data.Password) && !string.IsNullOrWhiteSpace(data.NewPassword))
                {
                    // Verify password
                    if (BCryptNet.Verify(data.Password, user.Password))
                    {
                        // Hash password using Bcrypt
                        user.Password = BCryptNet.HashPassword(data.NewPassword);
                        update = true;
                    }
                    else
                    {
                        // Return error message
                        return Unauthorized("Incorrect password");
                    }
                }
                else
                {
                    // Return error message
                    return BadRequest("Data is invalid");
                }
            }
            // Check if user is updating role
            if (data.Role.HasValue)
            {
                // Check if request user is admin
                if (admin)
                {
                    // Update user role
                    user.Role = data.Role.Value;
                    update = true;
                }
                else
                {
                    // Return error message
                    return Unauthorized("User is not authorised to update roles");
                }
            }
            if (update)
            {
                // Save updated user to database
                await _context.User.UpdateAsync(_context, user);
                // Return message
                return Ok("User is updated");
            }
            // Return message
            return Ok("No changes detected");
        }
    }
}
