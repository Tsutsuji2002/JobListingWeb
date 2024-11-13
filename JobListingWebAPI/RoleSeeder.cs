using Microsoft.AspNetCore.Identity;

namespace JobListingWebAPI
{
    public static class RoleSeeder
    {
        public static async Task SeedRoles(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Applicant", "Employer" };

            foreach (var roleName in roles)
            {
                // Check if the role already exists
                var roleExists = await roleManager.RoleExistsAsync(roleName);
                if (!roleExists)
                {
                    // Create the role if it doesn't exist
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
        }
    }
}
