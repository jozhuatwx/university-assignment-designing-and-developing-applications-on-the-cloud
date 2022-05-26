using BMU.Controllers;
using BMU.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace BMU.Controllers
{
    public class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions>()))
            {
                if (!context.User.HasData())
                {
                    context.User.CreateAsync(context, new User
                    {
                        Name = "Admin",
                        Email = "admin@mail.com",
                        Role = UserRole.Admin,
                        Password = "$2a$11$0EKPDZF27tmxgioMTLJHN.eeeuTQSXhu/QLVX45T/QSmxk8Lu5srC"
                    }).Wait();
                }
            }
        }
    }
}
