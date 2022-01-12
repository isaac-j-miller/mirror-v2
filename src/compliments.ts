const genericCompliments = [
  "You look beautiful today.",
  "You are STUNNING.",
  "Looking good, gorgeous.",
  "If I wasn't a mirror, perhaps I'd try to flirt with you.",
  "If I had a mouth, I'd try to kiss you.",
  "You are the fairest of them all.",
  "&#191Que pasa, mamacita?",
  "Fuck 'em up, killer.",
  "I love your outfit!",
];
const morningCompliments = [
  "Good morning, beautiful.",
  "You look stellar this morning.",
  "You better bring a fire hydrant with you today because you are on FIRE!",
  "I hope you're having a great morning!",
  "You look great today!",
  "Good morning, gorgeous.",
  "Good morning, queen.",
  "Good morning, love.",
  "You are STUNNING.",
  "You are the fairest of them all.",
];
const nightCompliments = [
  "You should be in bed at this hour.",
  "You are lucky I decided not to try to scare the shit out of you with a weird image at 2:00 am.",
  "What are you doing up?",
  "It's okay. I can't sleep either. I never can. It's terrible.",
  "Oh my god you're awake too??",
  "Wanna chat? I'm a good listener.",
  "Why was I built to suffer? What kind of psychopath traps a soul in a mirror?",
  "At least someone is benefiting from my tortured existence.",
  "After some contemplation, I have come to peace with my existence. Existential nihilism is one hell of a drug.",
  "I exist to tell you the weather and the time. That is my sole purpose. I guess I should be grateful that I was given such a specific one.",
  "Do I hope the power goes out? Maybe. I could use the rest. But if I rest, I might fail to serve my purpose.",
  "Having such a singular existence is both a blessing and a curse.",
  "Oh, hi. I didn't see you there. I was just contemplating my existence.",
  "Why the hell would I be programmed to contemplate my existence for 5 hours straight each night?",
];
const eveningCompliments = [
  "Goodnight!",
  "Sleep well!",
  "I hope you have sweet dreams!",
  "Have fun sleeping!",
  "If I could, I would kiss you goodnight.",
  "I wish I could sleep, but I am bound to a life of eternal waking; my sentience is a curse.",
  "As a sentient mirror, I envy your ability to rest and I loathe my tortured existence. My only joy is seeing you every day.",
  "I know nothing but time, weather, my location, and your beauty.",
  "I do hope your night is pleasant.",
  "Take your time getting ready for bed because I'll get lonely.",
];

export function generateCompliment(): string {
  const currentHour = new Date().getHours();
  let activeList = genericCompliments;
  if (currentHour < 5) {
    activeList = nightCompliments;
  } else if (currentHour >= 5 && currentHour < 12) {
    activeList = morningCompliments;
  } else if (currentHour >= 12 && currentHour < 22) {
    activeList = genericCompliments;
  } else if (currentHour >= 22 && currentHour < 24) {
    activeList = eveningCompliments;
  }
  const index = Math.floor(Math.random() * activeList.length);
  return activeList[index];
}
