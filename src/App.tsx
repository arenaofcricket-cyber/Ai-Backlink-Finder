import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenLine,
  User,
  MessageSquare,
  Folder,
  HelpCircle,
  Globe,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link2,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// --- Database ---
const DB = [
  { name: "Medium", url: "https://medium.com", cat: "Guest Post", da: 95, niche: ["tech", "marketing", "business", "startup", "writing", "seo", "design"], note: "Publish articles with contextual backlinks in your bio and content body.", meta: "Medium is an open platform where over 100 million readers come to find insightful and dynamic thinking." },
  { name: "HubPages", url: "https://hubpages.com", cat: "Guest Post", da: 91, niche: ["marketing", "health", "lifestyle", "business", "writing"], note: "Long-form article platform; link back to your site within your content.", meta: "HubPages is a network of sites where people write about their passions! Join for free and start sharing your knowledge." },
  { name: "Vocal Media", url: "https://vocal.media", cat: "Guest Post", da: 80, niche: ["tech", "lifestyle", "business", "writing", "design"], note: "Content platform that allows dofollow links in published stories.", meta: "Vocal is a platform for supporting, discovering and rewarding creators. We provide the tools and communities for writers." },
  { name: "Business2Community", url: "https://business2community.com", cat: "Guest Post", da: 85, niche: ["marketing", "business", "seo", "tech", "social media"], note: "Submit guest articles targeting business and marketing audiences.", meta: "Business 2 Community covers breaking news and top trends in Social Media, Digital Marketing, Content Marketing, and more." },
  { name: "Jeff Bullas", url: "https://jeffbullas.com/write-for-us", cat: "Guest Post", da: 75, niche: ["marketing", "social media", "seo", "business"], note: "Accepts contributor posts on digital marketing topics.", meta: "Jeff Bullas is a digital entrepreneur, marketing blogger, keynote speaker, and best-selling author." },
  { name: "Search Engine Journal", url: "https://www.searchenginejournal.com/write-for-sej", cat: "Guest Post", da: 90, niche: ["seo", "marketing", "ppc", "content"], note: "High-authority guest posting for SEO and digital marketing professionals.", meta: "Search Engine Journal is dedicated to producing the latest search news, the best guides and how-tos for the SEO community." },
  { name: "Entrepreneur", url: "https://www.entrepreneur.com/contribute", cat: "Guest Post", da: 92, niche: ["business", "startup", "marketing", "finance", "leadership"], note: "Contribute expert articles to one of the most-read business publications.", meta: "Advice, insight, profiles and guides for established and aspiring entrepreneurs worldwide." },
  { name: "Forbes Councils", url: "https://councils.forbes.com", cat: "Guest Post", da: 94, niche: ["business", "finance", "tech", "marketing", "leadership"], note: "Application-based contributor program; strong authority signal.", meta: "Forbes Councils is a collective of invitation-only communities created in partnership with Forbes and the expert community builders." },
  { name: "Moz Blog", url: "https://moz.com/blog/contributing", cat: "Guest Post", da: 92, niche: ["seo", "marketing", "link building"], note: "Accepts high-quality technical SEO and marketing posts.", meta: "The Moz SEO blog provides tips, tricks, and advice for improving your website's search engine ranking." },
  { name: "Copyblogger", url: "https://copyblogger.com/guest-blogging", cat: "Guest Post", da: 85, niche: ["writing", "content", "marketing", "seo"], note: "Focuses on content strategy and copywriting; strong dofollow links.", meta: "Copyblogger has been teaching people how to create killer online content since January 2006." },
  { name: "About.me", url: "https://about.me", cat: "Profile Link", da: 91, niche: ["all"], note: "Create a professional profile page with a direct link to your website.", meta: "Create a page to show who you are and what you do. It's your personal brand, simplified." },
  { name: "Crunchbase", url: "https://crunchbase.com", cat: "Profile Link", da: 91, niche: ["startup", "business", "tech", "finance"], note: "Add your company profile with website link; great for startups and tech.", meta: "Crunchbase is the leading destination for company insights from early-stage startups to the Fortune 1000." },
  { name: "AngelList (Wellfound)", url: "https://wellfound.com", cat: "Profile Link", da: 87, niche: ["startup", "tech", "business"], note: "Startup-focused profile with dofollow link to your website.", meta: "Wellfound is the place where the startup world works. Apply to 130,000+ startup jobs with one application." },
  { name: "Product Hunt", url: "https://producthunt.com", cat: "Profile Link", da: 90, niche: ["tech", "startup", "saas", "design", "productivity"], note: "Launch your product and earn profile + maker page backlinks.", meta: "Product Hunt is a curation of the best new products, every day. Discover the latest mobile apps, websites, and technology products." },
  { name: "GitHub", url: "https://github.com", cat: "Profile Link", da: 96, niche: ["tech", "developer", "programming", "saas", "open source"], note: "Add website URL in your GitHub bio for a high-DA profile link.", meta: "GitHub is where over 100 million developers shape the future of software, together." },
  { name: "LinkedIn", url: "https://linkedin.com", cat: "Social", da: 99, niche: ["all"], note: "Company and personal profiles allow website URL in the bio section.", meta: "Manage your professional identity. Build and engage with your professional network." },
  { name: "Twitter/X", url: "https://x.com", cat: "Social", da: 95, niche: ["all"], note: "Add your URL in the bio; great for brand visibility alongside SEO.", meta: "From breaking news and entertainment to sports and politics, get the full story with all the live commentary." },
  { name: "Behance", url: "https://behance.net", cat: "Profile Link", da: 91, niche: ["design", "creative", "photography", "art", "portfolio"], note: "Portfolio platform with links to your website in profile and project pages.", meta: "Behance is the world's largest creative network for showcasing and discovering creative work." },
  { name: "Dribbble", url: "https://dribbble.com", cat: "Profile Link", da: 90, niche: ["design", "ui", "ux", "creative"], note: "Add website link in your Dribbble profile for design-niche backlinks.", meta: "Dribbble is the world's leading community for creatives to share, grow, and get hired." },
  { name: "Indie Hackers", url: "https://indiehackers.com", cat: "Profile Link", da: 82, niche: ["startup", "saas", "business", "tech", "marketing"], note: "Founder community; add your product link in profile and posts.", meta: "Indie Hackers is a community where the founders of profitable businesses and side projects share their stories." },
  { name: "Reddit", url: "https://reddit.com", cat: "Forum", da: 96, niche: ["all"], note: "Participate in relevant subreddits and share links in context; high-traffic.", meta: "Reddit is a network of communities where people can dive into their interests, hobbies and passions." },
  { name: "Quora", url: "https://quora.com", cat: "Q&A", da: 93, niche: ["all"], note: "Answer questions in your niche and link to relevant content on your site.", meta: "Quora is a place to gain and share knowledge. It's a platform to ask questions and connect with people who contribute unique insights." },
  { name: "Stack Overflow", url: "https://stackoverflow.com", cat: "Q&A", da: 96, niche: ["tech", "developer", "programming", "saas"], note: "Answer technical questions; link to your posts or tools when relevant.", meta: "Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge." },
  { name: "Dev.to", url: "https://dev.to", cat: "Forum", da: 88, niche: ["tech", "developer", "programming", "saas"], note: "Developer community blog platform with high engagement and backlinks.", meta: "A constructive and inclusive social network for software developers. With you every step of your journey." },
  { name: "Hacker News", url: "https://news.ycombinator.com", cat: "Forum", da: 91, niche: ["tech", "startup", "business", "saas", "programming"], note: "Submit links to your content; significant traffic if it resonates.", meta: "Hacker News is a social news website focusing on computer science and entrepreneurship." },
  { name: "Warrior Forum", url: "https://warriorforum.com", cat: "Forum", da: 79, niche: ["marketing", "seo", "affiliate", "business"], note: "Classic internet marketing forum; participate and link to your resources.", meta: "The #1 Internet Marketing Forum since 1997. Join the community and learn from the experts." },
  { name: "GrowthHackers", url: "https://growthhackers.com", cat: "Forum", da: 80, niche: ["marketing", "growth", "startup", "saas"], note: "Share and discuss growth strategies; link to articles you publish.", meta: "GrowthHackers is the premier community to collaborate and share growth marketing resources." },
  { name: "Inbound.org", url: "https://inbound.org", cat: "Forum", da: 70, niche: ["marketing", "seo", "content", "social media"], note: "Marketing community for sharing and discussing content with backlinks.", meta: "A community for inbound marketers to share and discuss the latest news and trends." },
  { name: "DigitalPoint Forums", url: "https://forums.digitalpoint.com", cat: "Forum", da: 80, niche: ["seo", "marketing", "business", "tech", "affiliate"], note: "Long-running webmaster forum; good for niche discussions and links.", meta: "The largest webmaster community in the world. Includes tools and forums for SEO, marketing, and more." },
  { name: "Moz Community", url: "https://moz.com/community", cat: "Q&A", da: 92, niche: ["seo", "marketing", "link building"], note: "Ask and answer SEO questions; profile link and contextual citations.", meta: "Connect with the SEO community, ask questions, and share your expertise on the Moz Community." },
  { name: "Best of the Web", url: "https://botw.org", cat: "Directory", da: 70, niche: ["all"], note: "Web directory submission; adds a permanent dofollow link to your site.", meta: "Best of the Web is the internet's most trusted directory, helping users find the best websites since 1994." },
  { name: "Yelp", url: "https://yelp.com", cat: "Directory", da: 94, niche: ["local", "business", "restaurant", "health", "service"], note: "Business listing with website URL; crucial for local SEO.", meta: "User Reviews and Recommendations of Best Restaurants, Shopping, Nightlife, Food, Entertainment, Things to Do, Services and More." },
  { name: "Yellow Pages", url: "https://yellowpages.com", cat: "Directory", da: 89, niche: ["local", "business", "service", "health"], note: "Classic directory listing; strong local SEO backlink.", meta: "The real Yellow Pages. Search for local businesses, get directions, and find the information you need." },
  { name: "Bing Places", url: "https://bingplaces.com", cat: "Directory", da: 96, niche: ["local", "business", "all"], note: "Bing's business directory; adds NAP + website link citation.", meta: "Bing Places for Business is a free Bing service that enables local business owners to add their business listings to Bing." },
  { name: "Foursquare", url: "https://foursquare.com", cat: "Directory", da: 91, niche: ["local", "restaurant", "travel", "lifestyle"], note: "Location-based listing with website link; helps local ranking signals.", meta: "Foursquare helps you find the perfect places to go with friends. Discover the best food, nightlife, and entertainment in your city." },
  { name: "Clutch.co", url: "https://clutch.co", cat: "Directory", da: 84, niche: ["tech", "saas", "agency", "marketing", "design"], note: "B2B ratings site; company listing includes backlink to your site.", meta: "Clutch is the leader in connecting global service providers with corporate buyers from around the world." },
  { name: "G2", url: "https://g2.com", cat: "Directory", da: 90, niche: ["saas", "tech", "software", "business"], note: "Software review platform; claim your listing for a high-DA backlink.", meta: "G2 is the world's largest tech marketplace where businesses can discover, review, and manage the software they need." },
  { name: "Capterra", url: "https://capterra.com", cat: "Directory", da: 90, niche: ["saas", "software", "tech", "business"], note: "Software directory popular with B2B buyers; strong authority signal.", meta: "Capterra is the web's most comprehensive software directory. We help you find the right software for your business." },
  { name: "Hotfrog", url: "https://hotfrog.com", cat: "Directory", da: 68, niche: ["local", "business", "service"], note: "Free business directory; easy submission and permanent backlink.", meta: "Hotfrog helps 69 million businesses reach more customers. Add your business for free today." },
  { name: "Manta", url: "https://manta.com", cat: "Directory", da: 71, niche: ["local", "business", "service", "marketing"], note: "Small business directory with company profiles and website links.", meta: "Manta helps small businesses grow by providing the tools and resources they need to succeed." },
  { name: "SlideShare", url: "https://slideshare.net", cat: "Profile Link", da: 95, niche: ["business", "tech", "marketing", "education"], note: "Upload presentations with links in the description and profile bio.", meta: "Discover, Share, and Present presentations and infographics with the world's largest professional content community." },
  { name: "Scribd", url: "https://scribd.com", cat: "Profile Link", da: 94, niche: ["writing", "business", "tech", "education"], note: "Share documents and PDFs that include links to your website.", meta: "Enjoy millions of ebooks, audiobooks, magazines, podcasts, sheet music, and documents for free with a 30 day free trial." },
  { name: "Issuu", url: "https://issuu.com", cat: "Profile Link", da: 94, niche: ["design", "marketing", "business", "publishing"], note: "Publish digital magazines or brochures with embedded links.", meta: "Issuu is the best way to publish and share digital content online. Create once, share everywhere." },
  { name: "SoundCloud", url: "https://soundcloud.com", cat: "Social", da: 94, niche: ["music", "podcast", "audio", "creative"], note: "Add your website link to your profile and track descriptions.", meta: "SoundCloud is the world's largest open audio platform, powered by a connected community of creators, listeners, and curators." },
  { name: "Vimeo", url: "https://vimeo.com", cat: "Social", da: 96, niche: ["video", "creative", "film", "business"], note: "Include your URL in the video description and profile settings.", meta: "Vimeo is the world's most innovative video experience platform, providing professional tools for creators and businesses." },
  { name: "Pinterest", url: "https://pinterest.com", cat: "Social", da: 94, niche: ["all"], note: "Claim your website to get a high-authority profile link and pin links.", meta: "Pinterest is a visual discovery engine for finding ideas like recipes, home and style inspiration, and more." },
  { name: "Flickr", url: "https://flickr.com", cat: "Social", da: 92, niche: ["photography", "creative", "art"], note: "Add your website link to your profile bio and photo descriptions.", meta: "Flickr is almost certainly the best online photo management and sharing application in the world." },
  { name: "Dailymotion", url: "https://dailymotion.com", cat: "Social", da: 93, niche: ["video", "news", "entertainment"], note: "Include your website URL in your channel description and video metadata.", meta: "The latest news, sports, music and entertainment videos on Dailymotion." },
  { name: "Twitch", url: "https://twitch.tv", cat: "Social", da: 93, niche: ["gaming", "tech", "entertainment"], note: "Add panels with links to your website on your channel page.", meta: "Twitch is the world's leading video platform and community for gamers." },
  { name: "Patreon", url: "https://patreon.com", cat: "Social", da: 92, niche: ["creative", "content", "business"], note: "Link to your main site from your creator profile and public posts.", meta: "Patreon is a creator-founded platform that helps creators build memberships by providing exclusive access to their work." }
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Guest Post', label: 'Guest posts' },
  { id: 'Profile Link', label: 'Profile links' },
  { id: 'Forum', label: 'Forums' },
  { id: 'Directory', label: 'Directories' },
  { id: 'Q&A', label: 'Q&A sites' },
  { id: 'Social', label: 'Social profiles' },
];

const ICON_MAP: Record<string, any> = {
  "Guest Post": PenLine,
  "Profile Link": User,
  "Forum": MessageSquare,
  "Directory": Folder,
  "Q&A": HelpCircle,
  "Social": Globe,
};

const BADGE_COLORS: Record<string, string> = {
  "Guest Post": "bg-blue-100 text-blue-800",
  "Profile Link": "bg-green-100 text-green-800",
  "Forum": "bg-amber-100 text-amber-800",
  "Directory": "bg-purple-100 text-purple-800",
  "Q&A": "bg-red-100 text-red-800",
  "Social": "bg-pink-100 text-pink-800",
};

const ALL_NICHES = Array.from(new Set(DB.flatMap(item => item.niche))).filter(n => n !== 'all').sort();

export default function App() {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [minDA, setMinDA] = useState(0);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [refinement, setRefinement] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isNichesExpanded, setIsNichesExpanded] = useState(true);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);
  const [analyzedNiche, setAnalyzedNiche] = useState<string[]>([]);
  const [analyzedDA, setAnalyzedDA] = useState<number | null>(null);
  const [broaderTopics, setBroaderTopics] = useState<string[]>([]);
  const [isAnalyzingTopics, setIsAnalyzingTopics] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const scoredResults = useMemo(() => {
    const extractKeywords = (u: string, k: string) => {
      const base = (u + " " + k).toLowerCase()
        .replace(/https?:\/\/|www\./g, "")
        .split(/[\s.,\-_/]+/)
        .filter(w => w.length > 2);
      
      // Add analyzed niches and broader topics to keywords for scoring
      return [...new Set([
        ...base, 
        ...analyzedNiche.map(n => n.toLowerCase()),
        ...broaderTopics.map(t => t.toLowerCase())
      ])];
    };

    const keywords = extractKeywords(url, keyword);

    const score = (item: any, kws: string[]) => {
      let s = 0;
      const nicheSpecificityBoost = item.niche.includes("all") ? 1 : (10 / item.niche.length);
      
      // 1. Topical Authority Score
      // Base niche matching
      if (item.niche.includes("all")) s += 5;
      let nicheMatches = 0;
      let broaderTopicMatches = 0;

      for (const kw of kws) {
        const lowerKw = kw.toLowerCase();
        for (const n of item.niche) {
          const lowerNiche = n.toLowerCase();
          if (lowerNiche === lowerKw) {
            // Higher weight for direct keyword matches
            const isBroader = broaderTopics.some(t => t.toLowerCase() === lowerKw);
            s += (isBroader ? 15 : 25) * nicheSpecificityBoost; 
            if (isBroader) broaderTopicMatches++;
            else nicheMatches++;
          } else if (lowerNiche.includes(lowerKw) || lowerKw.includes(lowerNiche)) {
            s += 10 * nicheSpecificityBoost;
            nicheMatches++;
          }
        }
      }

      // Topical Authority Bonus: If multiple keywords match the niche, it's a strong topical fit
      if (nicheMatches >= 2) s += 15;
      // Broader Topic Bonus: If the site matches the broader industry context
      if (broaderTopicMatches >= 1) s += 10;

      // 2. DA Similarity Score if analyzedDA is present
      if (analyzedDA !== null) {
        const daDiff = Math.abs(item.da - analyzedDA);
        if (daDiff <= 5) s += 15;
        else if (daDiff <= 15) s += 8;
      }

      // 3. Anchor Text Relevance & Contextual Fit
      const contentText = (item.name + " " + item.note).toLowerCase();
      
      let keywordDensity = 0;
      for (const kw of kws) {
        const lowerKw = kw.toLowerCase();
        const isBroader = broaderTopics.some(t => t.toLowerCase() === lowerKw);
        const parts = contentText.split(lowerKw);
        const count = parts.length - 1;
        if (count > 0) {
          s += count * (isBroader ? 2 : 6); // Broader terms count less for density
          keywordDensity += count;
        }
      }

      // Anchor Text Bonus: If the keyword is near anchor-related terms in the note
      const anchorRelevancePatterns = ["contextual", "content body", "article", "post", "anchor", "citation", "editorial"];
      const hasAnchorFlexibility = anchorRelevancePatterns.some(p => item.note.toLowerCase().includes(p));
      
      if (hasAnchorFlexibility) {
        s += 15;
        for (const kw of kws) {
          if (item.note.toLowerCase().includes(kw.toLowerCase())) {
            const isBroader = broaderTopics.some(t => t.toLowerCase() === kw.toLowerCase());
            s += isBroader ? 5 : 12; // Direct keywords get more anchor bonus
          }
        }
      }

      // 4. Category Weights
      const typeWeights: Record<string, number> = {
        "Guest Post": 25, "Q&A": 15, "Forum": 10, "Profile Link": 6, "Directory": 4, "Social": 3
      };
      s += typeWeights[item.cat] || 0;

      // 5. Domain Authority Base Score
      s += Math.floor(item.da / 10) * 4;
      if (item.da >= 90) s += 15;
      
      return Math.round(s);
    };

    const scored = DB.map(item => ({ ...item, score: score(item, keywords) }))
      .sort((a, b) => b.score - a.score);

    let finalResults: any[] = scored.filter(i => i.score > 0);
    if (finalResults.length === 0) {
      finalResults = [...DB].map(item => ({ ...item, score: 0 })).sort((a, b) => b.da - a.da);
    }
    return finalResults;
  }, [url, keyword, analyzedNiche, analyzedDA, broaderTopics]);

  const fetchBroaderTopics = async (kw: string) => {
    if (!kw) return;
    setIsAnalyzingTopics(true);
    try {
      const prompt = `For the SEO keyword "${kw}", identify 3-5 broader industry topics or parent niches. Return ONLY a comma-separated list. Example for "SaaS SEO": "Software, Technology, Marketing, Business"`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const topics = response.text?.split(',').map(t => t.trim()) || [];
      setBroaderTopics(topics);
    } catch (error) {
      console.error("Error fetching broader topics:", error);
    } finally {
      setIsAnalyzingTopics(false);
    }
  };

  const analyzeReferenceUrl = async () => {
    if (!referenceUrl) return;
    setIsAnalyzingRef(true);
    try {
      const prompt = `Analyze the website URL "${referenceUrl}". Determine its primary niches (max 3) and estimate its Domain Authority (DA) on a scale of 1-100. 
      Return ONLY a JSON object with "niches" (array of strings) and "da" (number). Example: {"niches": ["Tech", "SaaS"], "da": 85}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.niches) setAnalyzedNiche(data.niches);
      if (data.da) setAnalyzedDA(data.da);
      setHasSearched(true);
    } catch (error) {
      console.error("Error analyzing reference URL:", error);
    } finally {
      setIsAnalyzingRef(false);
    }
  };

  const generateSuggestions = async (inputUrl: string, inputKw: string) => {
    if (!inputUrl && !inputKw) return;
    
    setIsGeneratingSuggestions(true);
    try {
      const prompt = `Given a website URL "${inputUrl}" and a target keyword "${inputKw}", suggest 5-7 highly relevant, short link-building keywords or niches that would help find backlink opportunities. Return ONLY a comma-separated list of keywords. No explanations.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "";
      const suggestedKws = text.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.toLowerCase() !== inputKw.toLowerCase())
        .slice(0, 6);
      
      setSuggestions(suggestedKws);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSearch = (customKw?: string) => {
    const searchKw = customKw !== undefined ? customKw : keyword;
    if (!url && !searchKw) return;
    setHasSearched(true);
    if (!isGeneratingSuggestions) {
      generateSuggestions(url, searchKw);
    }
    fetchBroaderTopics(searchKw);
  };

  const handleSuggestionClick = (sug: string) => {
    setKeyword(sug);
    setHasSearched(true);
    generateSuggestions(url, sug);
  };

  const baseFilteredResults = useMemo(() => {
    return scoredResults.filter(i => {
      const matchesDA = i.da >= minDA;
      const matchesNiche = selectedNiches.length === 0 || 
                          i.niche.includes('all') || 
                          selectedNiches.some(sn => i.niche.includes(sn));
      const matchesRefinement = refinement === '' || 
                               i.name.toLowerCase().includes(refinement.toLowerCase()) ||
                               i.note.toLowerCase().includes(refinement.toLowerCase()) ||
                               i.url.toLowerCase().includes(refinement.toLowerCase());
      return matchesDA && matchesNiche && matchesRefinement;
    });
  }, [scoredResults, minDA, selectedNiches, refinement]);

  const filteredResults = useMemo(() => {
    const filtered = baseFilteredResults.filter(i => {
      return activeFilter === 'all' || i.cat === activeFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.da - a.da;
      } else {
        return a.da - b.da;
      }
    });
  }, [baseFilteredResults, activeFilter, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: baseFilteredResults.length,
      guest: baseFilteredResults.filter(i => i.cat === "Guest Post").length,
      profile: baseFilteredResults.filter(i => i.cat === "Profile Link").length,
      forum: baseFilteredResults.filter(i => i.cat === "Forum").length,
      qa: baseFilteredResults.filter(i => i.cat === "Q&A").length,
      directory: baseFilteredResults.filter(i => i.cat === "Directory").length,
      social: baseFilteredResults.filter(i => i.cat === "Social").length,
    };
  }, [baseFilteredResults]);

  const isSearching = hasSearched || keyword.length > 0 || selectedNiches.length > 0 || refinement.length > 0;

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"
          >
            <Link2 className="w-6 h-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif text-text-main tracking-tight mb-1">
                Backlink Finder
              </h1>
            </div>
            <p className="text-text-muted font-sans text-sm">
              Discover link-building opportunities for your website
            </p>
          </div>
        </header>

        {/* Search Box */}
        <div className="bg-surface border border-border-strong rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest block mb-2">Your Website</label>
                <input
                  type="text"
                  placeholder="e.g. myblog.com"
                  className="w-full h-10 px-4 bg-bg border border-border-strong rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest block mb-2">Target Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. digital marketing"
                  className="w-full h-10 px-4 bg-bg border border-border-strong rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest block mb-2">Find Similar to Reference URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Enter a competitor or reference URL (e.g. techcrunch.com)"
                    className="w-full h-10 px-4 bg-bg border border-border-strong rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all pr-10"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                  />
                  {isAnalyzingRef && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={analyzeReferenceUrl}
                  disabled={isAnalyzingRef || !referenceUrl}
                  className="h-10 px-6 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze & Match
                </button>
              </div>
              
              {analyzedNiche.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <span className="text-[10px] font-medium text-text-dim">Analyzed:</span>
                  {analyzedNiche.map(n => (
                    <span key={n} className="text-[10px] px-2 py-0.5 bg-accent/5 text-accent border border-accent/10 rounded-full">
                      {n}
                    </span>
                  ))}
                  {analyzedDA && (
                    <span className="text-[10px] px-2 py-0.5 bg-surface-2 text-text-muted rounded-full">
                      Est. DA {analyzedDA}
                    </span>
                  )}
                  {broaderTopics.length > 0 && (
                    <div className="flex items-center gap-2 ml-2 border-l border-border-subtle pl-2">
                      <span className="text-[10px] font-medium text-text-dim">Topical Context:</span>
                      {broaderTopics.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-surface-2 text-text-muted rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      setAnalyzedNiche([]);
                      setAnalyzedDA(null);
                      setReferenceUrl('');
                      setBroaderTopics([]);
                    }}
                    className="text-[10px] text-text-dim hover:text-accent underline ml-1"
                  >
                    Reset
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => handleSearch()}
              className="h-10 w-full bg-text-main text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 mt-2"
            >
              <Link2 className="w-4 h-4" />
              Find opportunities
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Refine results (e.g. 'guest', 'tech', 'moz')"
                className="w-full h-10 pl-10 pr-4 bg-bg border border-border-strong rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <AnimatePresence>
            {(suggestions.length > 0 || isGeneratingSuggestions) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-border-subtle"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                    Suggested Keywords
                  </span>
                  {isGeneratingSuggestions && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-[10px] text-accent font-medium"
                    >
                      Generating...
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sug, idx) => (
                    <motion.button
                      key={sug + idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-3 py-1 bg-surface-2 hover:bg-accent/10 hover:text-accent text-text-muted text-[11px] rounded-lg transition-all border border-transparent hover:border-accent/20"
                    >
                      {sug}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-6">
            {/* Category Filter */}
            <div>
              <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest mb-3 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      activeFilter === cat.id
                        ? 'bg-text-main text-white border-text-main'
                        : 'bg-transparent text-text-muted border-border-strong hover:bg-surface-2'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Niche Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => setIsNichesExpanded(!isNichesExpanded)}
                  className="flex items-center gap-2 group"
                >
                  <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest block cursor-pointer group-hover:text-text-main transition-colors">
                    Niche / Industry
                  </label>
                  {isNichesExpanded ? (
                    <ChevronUp className="w-3 h-3 text-text-dim group-hover:text-text-main transition-colors" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-text-dim group-hover:text-text-main transition-colors" />
                  )}
                </button>
                {selectedNiches.length > 0 && (
                  <button 
                    onClick={() => setSelectedNiches([])}
                    className="text-[10px] font-medium text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {isNichesExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border-strong">
                      {ALL_NICHES.map((niche) => (
                        <button
                          key={niche}
                          onClick={() => {
                            setSelectedNiches(prev => 
                              prev.includes(niche) 
                                ? prev.filter(n => n !== niche) 
                                : [...prev, niche]
                            );
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            selectedNiches.includes(niche)
                              ? 'bg-accent/10 text-accent border-accent/30'
                              : 'bg-transparent text-text-muted border-border-strong hover:bg-surface-2'
                          }`}
                        >
                          {niche.charAt(0).toUpperCase() + niche.slice(1)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DA Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest block">
                  Minimum Domain Authority (DA)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minDA}
                    onChange={(e) => setMinDA(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-12 h-7 text-center text-xs font-medium text-accent bg-accent/5 border border-accent/20 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-[10px] font-medium text-text-dim">DA+</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minDA}
                onChange={(e) => setMinDA(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between mt-2 text-[10px] text-text-dim font-medium">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
            >
              <StatCard 
                label="Total found" 
                value={stats.total} 
                icon={Link2} 
                isActive={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              />
              <StatCard 
                label="Guest posts" 
                value={stats.guest} 
                icon={PenLine} 
                isActive={activeFilter === 'Guest Post'}
                onClick={() => setActiveFilter('Guest Post')}
              />
              <StatCard 
                label="Profile links" 
                value={stats.profile} 
                icon={User} 
                isActive={activeFilter === 'Profile Link'}
                onClick={() => setActiveFilter('Profile Link')}
              />
              <StatCard 
                label="Forums" 
                value={stats.forum} 
                icon={MessageSquare} 
                isActive={activeFilter === 'Forum'}
                onClick={() => setActiveFilter('Forum')}
              />
              <StatCard 
                label="Q&A sites" 
                value={stats.qa} 
                icon={HelpCircle} 
                isActive={activeFilter === 'Q&A'}
                onClick={() => setActiveFilter('Q&A')}
              />
              <StatCard 
                label="Directories" 
                value={stats.directory} 
                icon={Folder} 
                isActive={activeFilter === 'Directory'}
                onClick={() => setActiveFilter('Directory')}
              />
              <StatCard 
                label="Social" 
                value={stats.social} 
                icon={Globe} 
                isActive={activeFilter === 'Social'}
                onClick={() => setActiveFilter('Social')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-3">
          {!isSearching ? (
            <div className="text-center py-20 text-text-dim">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Enter your URL and keyword above to discover backlink opportunities.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest">
                  {filteredResults.length} OPPORTUNITIES FOUND
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-semibold text-text-dim uppercase tracking-widest">Sort by DA:</span>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1 px-2 py-1 bg-surface border border-border-subtle rounded-lg text-[10px] font-medium text-text-muted hover:border-border-strong transition-all"
                  >
                    {sortOrder === 'desc' ? (
                      <>
                        High to Low
                        <ArrowDownWideNarrow className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Low to High
                        <ArrowUpNarrowWide className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <AnimatePresence mode="popLayout">
                {filteredResults.map((item, idx) => (
                  <ResultCard key={`${item.name}-${idx}`} item={item} index={idx} />
                ))}
              </AnimatePresence>
              {filteredResults.length === 0 && (
                <div className="text-center py-12 text-text-dim border border-dashed border-border-strong rounded-2xl">
                  No results for this filter. Try a different category or niche.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, isActive, onClick }: { label: string; value: number; icon: any; isActive?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left bg-surface border rounded-xl p-4 shadow-sm transition-all hover:border-accent/30 active:scale-95 ${isActive ? 'border-accent ring-1 ring-accent/20 bg-accent/[0.02]' : 'border-border-subtle'}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-accent' : 'text-text-dim'}`}>{label}</div>
        <Icon className={`w-3 h-3 ${isActive ? 'text-accent' : 'text-text-dim opacity-50'}`} />
      </div>
      <div className={`text-2xl font-semibold ${isActive ? 'text-accent' : 'text-text-main'}`}>{value}</div>
    </button>
  );
}

interface ResultCardProps {
  item: any;
  index: number;
  key?: string;
}

function LinkStatusChecker({ url }: { url: string }) {
  const [status, setStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/check-link?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setStatus(data.status);
    } catch (err) {
      setError('Failed to check');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={checkLink}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border-subtle rounded-lg text-[10px] font-medium text-text-muted hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Activity className="w-3 h-3" />
        )}
        Check Link
      </button>
      
      {status !== null && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          status >= 200 && status < 300 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {status >= 200 && status < 300 ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          HTTP {status}
        </div>
      )}
      
      {error && (
        <span className="text-[10px] text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}

function ResultCard({ item, index }: ResultCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pageInfo, setPageInfo] = useState<{ title: string; h1: string; metaDescription: string } | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const Icon = ICON_MAP[item.cat] || Globe;
  const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(item.url)}?w=400`;

  useEffect(() => {
    if (isHovered && !pageInfo && !isLoadingInfo) {
      const fetchInfo = async () => {
        setIsLoadingInfo(true);
        try {
          const response = await fetch(`/api/page-info?url=${encodeURIComponent(item.url)}`);
          if (response.ok) {
            const data = await response.json();
            setPageInfo(data);
          }
        } catch (err) {
          console.error("Failed to fetch page info:", err);
        } finally {
          setIsLoadingInfo(false);
        }
      };
      fetchInfo();
    }
  }, [isHovered, item.url, pageInfo, isLoadingInfo]);

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      className="group relative bg-surface border border-border-subtle rounded-2xl p-5 hover:border-border-strong transition-all shadow-sm overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Screenshot Preview with Zoom */}
        <div className="w-full sm:w-40 h-24 rounded-xl overflow-hidden bg-surface-2 border border-border-subtle shrink-0 relative group-hover:border-accent/30 transition-colors">
          <motion.img
            src={screenshotUrl}
            alt={`${item.name} screenshot`}
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
            loading="lazy"
            animate={{ scale: isHovered ? 1.15 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted shrink-0 group-hover:bg-accent/5 group-hover:text-accent transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-base font-medium text-text-main">{item.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BADGE_COLORS[item.cat]}`}>
                {item.cat}
              </span>
              <span className="ml-auto text-[10px] font-medium text-text-dim bg-surface-2 px-2 py-0.5 rounded-full">
                DA {item.da}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1 break-all"
              >
                {item.url.replace('https://', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
              <LinkStatusChecker url={item.url} />
            </div>
            
            <div className="mt-3">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-wider hover:opacity-80 transition-opacity mb-1"
              >
                Strategy
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-text-muted leading-relaxed pt-1">
                      {item.note}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Meta Preview on Hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-3 p-3 bg-surface-2 border border-border-subtle rounded-xl"
                >
                  {isLoadingInfo ? (
                    <div className="flex items-center gap-2 text-[10px] text-text-dim">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Fetching live preview...
                    </div>
                  ) : pageInfo ? (
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Page Title:</div>
                        <p className="text-xs text-text-main font-medium line-clamp-1">{pageInfo.title}</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Main Heading (H1):</div>
                        <p className="text-xs text-text-muted line-clamp-1">{pageInfo.h1}</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">Description:</div>
                        <p className="text-xs text-text-muted italic leading-relaxed line-clamp-2">
                          "{pageInfo.metaDescription || item.meta}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Site Preview (Cached):</div>
                      <p className="text-xs text-text-muted italic leading-relaxed">
                        "{item.meta}"
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden sm:flex items-center">
            <ChevronRight className="w-5 h-5 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
