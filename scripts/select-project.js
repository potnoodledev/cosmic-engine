const inquirer = require('inquirer');
const { execSync } = require('child_process');

const projects = [
  {
    name: 'Phaser Idle Game',
    value: 'phaser-idle',
    description: 'A simple idle game built with Phaser'
  },
  {
    name: 'Pygame Card Drafting',
    value: 'pygame-card-drafting',
    description: 'A card drafting game built with Pygame'
  }
];

async function selectProject() {
  const { project } = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Which project would you like to run?',
      choices: projects
    }
  ]);

  console.log(`\nStarting ${projects.find(p => p.value === project).name}...\n`);
  
  try {
    execSync(`npm run run:${project}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running project:', error.message);
    process.exit(1);
  }
}

selectProject(); 