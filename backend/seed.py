from core.db import db

LABELS = {
    "curiosity-gap": "Curiosity Gap",
    "the-listicle": "The Listicle",
    "the-controversy": "The Controversy",
    "technical-insight": "Technical Insight",
}

HOOKS = [
    ("curiosity-gap", "Most Zimbabwean entrepreneurs are ignoring the one thing that actually keeps businesses alive in this economy. (Hint: It's not just the exchange rate.)", "Hustle Reality"),
    ("the-listicle", "7 practical ways to keep your team motivated when inflation is doing the most.", "Team Culture"),
    ("the-controversy", "Stop acting like a startup from Silicon Valley. Business in Zim requires a completely different playbook. Here is what to focus on instead.", "Featured Idea"),
    ("technical-insight", "Why importing everything instead of building local capacity is a mistake we'll all regret in 5 years.", "Authority Build"),
    ("curiosity-gap", "The 'Local Network' strategy: How I closed 5 major deals in Harare without a single formal pitch deck.", "Local Networking"),
    ("the-listicle", "3 underrated local industries where you can build a solid business with zero foreign investment.", "Expert Advice"),
    ("technical-insight", "Is formal employment actually safer? The math behind running a side hustle in Harare might shock you.", "Career Insights"),
    ("the-controversy", "Your business plan is too polished. If you aren't adapting your strategy every week in this market, you're burning money.", "Hard Truths"),
    ("curiosity-gap", "I almost shut my business down last year. One conversation with a vendor at Mbare changed everything.", "Founder Story"),
    ("the-listicle", "5 lessons from running a business on EcoCash, cash, and USD all in the same week.", "Operations"),
    ("the-controversy", "Unpopular opinion: Most 'networking events' in Harare are a waste of your Thursday evening.", "Hard Truths"),
    ("technical-insight", "We cut our delivery costs by 40% with one spreadsheet. Here's the exact formula we used.", "Operations"),
    ("curiosity-gap", "Nobody tells you this about hiring your first employee in Zimbabwe.", "Hiring"),
    ("the-listicle", "4 free tools I use every day to run a 10-person team from Bulawayo.", "Productivity"),
    ("the-controversy", "Funding is not your problem. Your pricing is.", "Pricing"),
    ("technical-insight", "Solar isn't a luxury anymore. Here's the payback math for a small shop running 8 hours of load-shedding a day.", "Energy"),
    ("curiosity-gap", "The best marketing decision we made cost exactly $0. It happened on a WhatsApp group.", "Marketing"),
    ("the-listicle", "6 questions I ask every client before quoting a single dollar.", "Sales"),
    ("the-controversy", "Stop waiting for the 'right economy' to start. There will never be a perfect time in Zim.", "Mindset"),
    ("technical-insight", "How we built a stock tracking system for our tuckshop chain using only Google Sheets and a $50 phone.", "Tech on a Budget"),
    ("curiosity-gap", "My biggest client came from a post I almost didn't publish.", "Personal Brand"),
    ("the-listicle", "3 signs your side hustle is ready to become a full-time business.", "Growth"),
    ("the-controversy", "Diaspora money is not a business strategy. Build something that survives without it.", "Hard Truths"),
    ("technical-insight", "The real cost of a ZiG price change: a breakdown of what happens to your margins in 30 days.", "Finance"),
]


async def seed_library():
    if await db.library_hooks.count_documents({}) >= len(HOOKS):
        return
    await db.library_hooks.delete_many({})
    docs = []
    for i, (cat, text, theme) in enumerate(HOOKS, start=1):
        doc = {"number": i, "category": cat, "category_label": LABELS[cat], "text": text, "theme": theme, "featured": i == 3}
        if i == 3:
            doc["title"] = "The Honest Take"
            doc["why"] = "Challenges the status quo and positions you as a thoughtful observer."
        docs.append(doc)
    await db.library_hooks.insert_many(docs)
