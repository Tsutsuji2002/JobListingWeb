using JobListingWebAPI.Entities;
using Microsoft.AspNetCore.Identity;

namespace JobListingWebAPI.Data
{
    public class JobListingWebDbContextSeed
    {
        public static async Task SeedDefaultAdminAsync(UserManager<ApplicationUser> userManager)
        {
            var adminUser = new AdminUser
            {
                UserName = "2024802010496@student.tdmu.edu.vn",
                Email = "2024802010496@student.tdmu.edu.vn",
                FirstName = "Donald",
                LastName = "Trump",
                City = "WashingtonDC",
                District = "Ward 1",
                CreateTime = DateTime.Now,
                ModifiedDate = DateTime.Now,
                LastLogin = DateTime.Now,
                UserType = "Admin"
            };

            if (await userManager.FindByEmailAsync(adminUser.Email) == null)
            {
                await userManager.CreateAsync(adminUser, "Ifilp0721@@");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
