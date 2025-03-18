@echo off
echo Card Creation Tool with Hugging Face Image Generation
echo ===================================================

if "%~1"=="" (
  echo Usage: create-card.bat "Card Name" "minion|spell|weapon" cost [attack] [health] "Card description" "Flavor text" "common|rare|epic|legendary"
  echo.
  echo Example for minion: create-card.bat "Fire Elemental" minion 5 5 5 "Battlecry: Deal 3 damage to any target." "The essence of fire, given form and purpose." rare
  echo Example for spell: create-card.bat "Fireball" spell 4 0 0 "Deal 6 damage." "This spell is useful for burning things." common
  exit /b 1
)

set NAME=%~1
set TYPE=%~2
set COST=%~3
set ATTACK=%~4
set HEALTH=%~5
set DESCRIPTION=%~6
set FLAVOR_TEXT=%~7
set RARITY=%~8

if "%TYPE%"=="minion" (
  if "%ATTACK%"=="" (
    echo Error: Attack is required for minions
    exit /b 1
  )
  if "%HEALTH%"=="" (
    echo Error: Health is required for minions
    exit /b 1
  )
)

echo Creating card: %NAME%
echo Type: %TYPE%
echo Cost: %COST%
if "%TYPE%"=="minion" (
  echo Attack: %ATTACK%
  echo Health: %HEALTH%
)
echo Description: %DESCRIPTION%
echo Flavor Text: %FLAVOR_TEXT%
echo Rarity: %RARITY%
echo.

node src/tools/createCardWithImage.js --name="%NAME%" --type="%TYPE%" --cost=%COST% --attack=%ATTACK% --health=%HEALTH% --description="%DESCRIPTION%" --flavorText="%FLAVOR_TEXT%" --rarity="%RARITY%"

echo.
echo Done! 