#!/bin/bash

echo "Card Creation Tool with Hugging Face Image Generation"
echo "==================================================="
echo

if [ -z "$1" ]; then
  echo "Usage: ./create-card.sh \"Card Name\" \"minion|spell|weapon\" cost [attack] [health] \"Card description\" \"Flavor text\" \"common|rare|epic|legendary\""
  echo
  echo "Example for minion: ./create-card.sh \"Fire Elemental\" minion 5 5 5 \"Battlecry: Deal 3 damage to any target.\" \"The essence of fire, given form and purpose.\" rare"
  echo "Example for spell: ./create-card.sh \"Fireball\" spell 4 0 0 \"Deal 6 damage.\" \"This spell is useful for burning things.\" common"
  exit 1
fi

NAME="$1"
TYPE="$2"
COST="$3"
ATTACK="$4"
HEALTH="$5"
DESCRIPTION="$6"
FLAVOR_TEXT="$7"
RARITY="$8"

if [ "$TYPE" = "minion" ]; then
  if [ -z "$ATTACK" ]; then
    echo "Error: Attack is required for minions"
    exit 1
  fi
  if [ -z "$HEALTH" ]; then
    echo "Error: Health is required for minions"
    exit 1
  fi
fi

echo "Creating card: $NAME"
echo "Type: $TYPE"
echo "Cost: $COST"
if [ "$TYPE" = "minion" ]; then
  echo "Attack: $ATTACK"
  echo "Health: $HEALTH"
fi
echo "Description: $DESCRIPTION"
echo "Flavor Text: $FLAVOR_TEXT"
echo "Rarity: $RARITY"
echo

node src/tools/createCardWithImage.js --name="$NAME" --type="$TYPE" --cost=$COST --attack=$ATTACK --health=$HEALTH --description="$DESCRIPTION" --flavorText="$FLAVOR_TEXT" --rarity="$RARITY"

echo
echo "Done!" 