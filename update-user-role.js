const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    console.log('Finding users...');
    
    // Get all users to see current state
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    console.log('Current users:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('No users found!');
      return;
    }
    
    // Update the first user to SUPER_ADMIN
    const userToUpdate = users[0];
    
    console.log(`\nUpdating ${userToUpdate.email} to SUPER_ADMIN role...`);
    
    const updatedUser = await prisma.user.update({
      where: { id: userToUpdate.id },
      data: { role: 'SUPER_ADMIN' },
    });
    
    console.log(`✅ Successfully updated ${updatedUser.email} to SUPER_ADMIN role!`);
    console.log('\nNow you can:');
    console.log('1. Log in as this user');
    console.log('2. Go to Manager Administration');
    console.log('3. Create a manager and assign platforms');
    console.log('4. Log in as the manager to test platform filtering');
    
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole(); 