from pymongo import UpdateOne
from pymongo.errors import BulkWriteError, OperationFailure

from core.db import db

LABELS = {
    "curiosity-gap": "Curiosity Gap",
    "the-listicle": "The Listicle",
    "the-controversy": "The Controversy",
    "technical-insight": "Technical Insight",
}

HOOKS = [
    ("curiosity-gap", "Most Zimbabwean entrepreneurs are ignoring the one thing that actually keeps businesses alive in this economy. (Hint: It's not just the exchange rate.)", "Hustle Reality", "linkedin,facebook,threads"),
    ("the-listicle", "7 practical ways to keep your team motivated when inflation is doing the most.", "Team Culture", "linkedin,facebook,instagram"),
    ("the-controversy", "Stop acting like a startup from Silicon Valley. Business in Zim requires a completely different playbook. Here is what to focus on instead.", "Featured Idea", "linkedin,x,threads"),
    ("technical-insight", "Why importing everything instead of building local capacity is a mistake we'll all regret in 5 years.", "Authority Build", "linkedin,x,youtube"),
    ("curiosity-gap", "The 'Local Network' strategy: How I closed 5 major deals in Harare without a single formal pitch deck.", "Local Networking", "linkedin,instagram,tiktok"),
    ("the-listicle", "3 underrated local industries where you can build a solid business with zero foreign investment.", "Expert Advice", "linkedin,instagram,youtube"),
    ("technical-insight", "Is formal employment actually safer? The math behind running a side hustle in Harare might shock you.", "Career Insights", "linkedin,x,tiktok,youtube"),
    ("the-controversy", "Your business plan is too polished. If you aren't adapting your strategy every week in this market, you're burning money.", "Hard Truths", "linkedin,x,threads"),
    ("curiosity-gap", "I almost shut my business down last year. One conversation with a vendor at Mbare changed everything.", "Founder Story", "instagram,tiktok,facebook"),
    ("the-listicle", "5 lessons from running a business on EcoCash, cash, and USD all in the same week.", "Operations", "linkedin,instagram,youtube"),
    ("the-controversy", "Unpopular opinion: Most 'networking events' in Harare are a waste of your Thursday evening.", "Hard Truths", "x,threads,facebook"),
    ("technical-insight", "We cut our delivery costs by 40% with one spreadsheet. Here's the exact formula we used.", "Operations", "linkedin,x,youtube"),
    ("curiosity-gap", "Nobody tells you this about hiring your first employee in Zimbabwe.", "Hiring", "linkedin,facebook,tiktok"),
    ("the-listicle", "4 free tools I use every day to run a 10-person team from Bulawayo.", "Productivity", "instagram,tiktok,youtube"),
    ("the-controversy", "Funding is not your problem. Your pricing is.", "Pricing", "x,threads,linkedin"),
    ("technical-insight", "Solar isn't a luxury anymore. Here's the payback math for a small shop running 8 hours of load-shedding a day.", "Energy", "youtube,facebook,linkedin"),
    ("curiosity-gap", "The best marketing decision we made cost exactly $0. It happened on a WhatsApp group.", "Marketing", "instagram,facebook,tiktok"),
    ("the-listicle", "6 questions I ask every client before quoting a single dollar.", "Sales", "linkedin,x,instagram"),
    ("the-controversy", "Stop waiting for the 'right economy' to start. There will never be a perfect time in Zim.", "Mindset", "threads,x,instagram"),
    ("technical-insight", "How we built a stock tracking system for our tuckshop chain using only Google Sheets and a $50 phone.", "Tech on a Budget", "youtube,tiktok,linkedin"),
    ("curiosity-gap", "My biggest client came from a post I almost didn't publish.", "Personal Brand", "linkedin,instagram,threads"),
    ("the-listicle", "3 signs your side hustle is ready to become a full-time business.", "Growth", "instagram,tiktok,facebook"),
    ("the-controversy", "Diaspora money is not a business strategy. Build something that survives without it.", "Hard Truths", "x,threads,linkedin"),
    ("technical-insight", "The real cost of a ZiG price change: a breakdown of what happens to your margins in 30 days.", "Finance", "linkedin,youtube,x"),
    ("curiosity-gap", "POV: You opened a shop in town and the first customer asked for credit.", "Reels Opener", "instagram,tiktok"),
    ("the-listicle", "I tried 5 ways to price my services in USD and ZiG. Number 4 changed everything.", "Video Series", "youtube,tiktok"),
    ("the-controversy", "Hot take: posting every day is killing your small business page.", "Social Strategy", "x,threads,instagram"),
    ("technical-insight", "Here's a 60-second breakdown of how mobile money fees quietly eat your profit.", "Short Explainer", "tiktok,youtube,instagram"),
    ("curiosity-gap", "We asked 100 Harare shoppers why they stopped buying online. The top answer surprised us.", "Community Poll", "facebook,x,threads"),
    ("the-listicle", "Save this: 7 caption formulas that get local customers to DM you.", "Carousel", "instagram,facebook"),
]


def _docs():
    for i, (cat, text, theme, platforms) in enumerate(HOOKS, start=1):
        doc = {"number": i, "category": cat, "category_label": LABELS[cat], "text": text, "theme": theme, "featured": i == 3, "platforms": platforms.split(",")}
        if i == 3:
            doc["title"] = "The Honest Take"
            doc["why"] = "Challenges the status quo and positions you as a thoughtful observer."
        yield doc


async def _ensure_unique_number():
    info = await db.library_hooks.index_information()
    if info.get("number_1", {}).get("unique"):
        return
    try:
        if "number_1" in info:
            await db.library_hooks.drop_index("number_1")
        await db.library_hooks.create_index("number", unique=True)
    except OperationFailure:
        await db.library_hooks.delete_many({})
        await db.library_hooks.create_index("number", unique=True)


async def seed_library():
    # Idempotent and safe when several cold starts run it at the same time
    await _ensure_unique_number()
    ops = [UpdateOne({"number": d["number"]}, {"$set": d}, upsert=True) for d in _docs()]
    try:
        await db.library_hooks.bulk_write(ops, ordered=False)
    except BulkWriteError:
        pass
    await db.library_hooks.delete_many({"number": {"$gt": len(HOOKS)}})
