using System;
using System.Threading.Tasks;
using BMU.Models;
using Microsoft.AspNetCore.Http;

namespace BMU.Controllers
{
    public static class Utils
    {
        public static async Task<User?> GetRequestUserFromHeaderAsync(IHeaderDictionary headers, DataContext context)
        {
            headers.TryGetValue("user-id", out var userIdString);
            var userId = new Guid(userIdString);
            if (userId != default)
            {
                return await context.User.GetAsync(userId);
            }
            return null;
        }

        public static async Task<bool> IsAdminFromHeaderAsync(IHeaderDictionary headers, DataContext context)
        {
            var requestUser = await GetRequestUserFromHeaderAsync(headers, context);
            return requestUser != null && requestUser.Role == UserRole.Admin;
        }

        public static async Task<bool> IsDriverFromHeaderAsync(IHeaderDictionary headers, DataContext context)
        {
            var requestUser = await GetRequestUserFromHeaderAsync(headers, context);
            return requestUser != null && requestUser.Role == UserRole.Driver;
        }
    }
}
