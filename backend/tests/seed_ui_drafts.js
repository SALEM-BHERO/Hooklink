// Seeds one TEST_ui draft per platform for UI preview testing (no LLM calls)
db.drafts.deleteMany({client_id: 'TEST_ui'});
const now = new Date().toISOString();
const plats = ['linkedin','instagram','facebook','x','threads','tiktok','youtube'];
const out = {};
plats.forEach((p) => {
  let body = 'A very long first line about building startups in Harare without waiting for perfect conditions or permission from anyone at all.\n\nSecond paragraph with value.\n\n#Startups';
  if (p === 'tiktok') body = 'HOOK (0-3s): Old hook line here\n\nSCENE 1: Show the office\nSCENE 2: Show the team\n\nCTA: Follow for more';
  if (p === 'x') body = '1/ First tweet about Harare startups.\n\n2/ Second tweet.\n\n3/ Third tweet.';
  if (p === 'youtube') body = 'My YouTube Title About Startups\n\nDescription line one.\n\n0:00 Intro';
  const r = db.drafts.insertOne({client_id: 'TEST_ui', topic: 'TEST topic ' + p, goal: 'brand', tone: 'storytelling', provider: 'groq', platform: p, post_body: body,
    hooks: [{title: 'H1', text: 'NEW HOOK ONE for ' + p}, {title: 'H2', text: 'NEW HOOK TWO'}, {title: 'H3', text: 'NEW HOOK THREE'}], created_at: now, updated_at: now});
  out[p] = r.insertedId.toString();
});
print(JSON.stringify(out));
