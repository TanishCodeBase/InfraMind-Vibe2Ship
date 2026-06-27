import { Timestamp } from "firebase/firestore";
import type { Issue } from "@/types/issue";

const createMockDate = (daysAgo: number) => {
  return Timestamp.fromDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
};

export const MOCK_ISSUES: Issue[] = [
  {
    id: "mock_pothole_001",
    title: "Hazardous crater-sized pothole on main carriage way",
    description: "Extremely deep pothole in the middle of the road. Multiple two-wheelers have lost balance. Highly hazardous when filled with rain water.",
    category: "pothole",
    status: "assigned",
    priority: "critical",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_01",
    reporterName: "Aravind Swamy",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9312, lng: 77.6244 },
      address: "80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka",
      locality: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034"
    },
    aiClassification: {
      category: "pothole",
      confidence: 0.97,
      suggestedPriority: "critical",
      tags: ["road-hazard", "pothole", "accident-prone"],
      reasoning: "Deep pothole on high-traffic carriage way. High risk of accident for two-wheelers makes this critical.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_pwd", departmentCode: "PWD", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 42, downvoteCount: 0, commentCount: 2, viewCount: 120, shareCount: 5, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(2) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to PWD", actor: "ai_agent", timestamp: createMockDate(2) },
      { id: "e3", type: "assigned", description: "Assigned to Ward Engineer, Koramangala Division", actor: "system", timestamp: createMockDate(1) }
    ],
    createdAt: createMockDate(2),
    updatedAt: createMockDate(1),
    tags: ["road-hazard", "pothole", "accident-prone"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_garbage_002",
    title: "Overflowing commercial garbage dump blocking footpath",
    description: "A huge pile of unsegregated wet and dry garbage dumped on the pavement. Emitting terrible smell, stray animals scattering it further.",
    category: "garbage_overflow",
    status: "in_progress",
    priority: "high",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_02",
    reporterName: "Meera Nair",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9100, lng: 77.6408 },
      address: "27th Main Rd, Sector 1, HSR Layout, Bengaluru, Karnataka",
      locality: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102"
    },
    aiClassification: {
      category: "garbage_overflow",
      confidence: 0.94,
      suggestedPriority: "high",
      tags: ["health-hazard", "obstruction", "garbage"],
      reasoning: "Commercial trash blocking footpaths in busy residential sector. Sanitary and public health concern.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bbmp", departmentCode: "BBMP", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 29, downvoteCount: 0, commentCount: 1, viewCount: 88, shareCount: 4, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(1) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BBMP SWM", actor: "ai_agent", timestamp: createMockDate(1) },
      { id: "e3", type: "status_changed", description: "Status changed to In Progress. Truck dispatched.", actor: "authority", timestamp: createMockDate(0.5) }
    ],
    createdAt: createMockDate(1),
    updatedAt: createMockDate(0.5),
    tags: ["health-hazard", "obstruction", "garbage"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_sewage_003",
    title: "Open drainage overflow and backflow",
    description: "Sewer water leaking from a cracked manhole lid, flooding market street. Terrible stench and mosquito breeding.",
    category: "sewage",
    status: "under_review",
    priority: "high",
    verificationStatus: "unverified",
    reportedBy: "citizen_blr_03",
    reporterName: "Rajesh Malhotra",
    isAnonymous: true,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9784, lng: 77.6408 },
      address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038"
    },
    aiClassification: {
      category: "sewage",
      confidence: 0.92,
      suggestedPriority: "high",
      tags: ["sanitation", "sewage", "health-hazard"],
      reasoning: "Sewer manhole leak flooding high foot-traffic commercial street. Risk of water-borne infections.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bwssb", departmentCode: "BWSSB", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 15, downvoteCount: 0, commentCount: 0, viewCount: 45, shareCount: 1, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported anonymously", actor: "citizen", timestamp: createMockDate(0.25) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BWSSB Sewage Division", actor: "ai_agent", timestamp: createMockDate(0.25) }
    ],
    createdAt: createMockDate(0.25),
    updatedAt: createMockDate(0.25),
    tags: ["sanitation", "sewage", "health-hazard"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_light_004",
    title: "Flickering and dead streetlight causing dark alleyway",
    description: "Streetlight outside residential block is completely dead. The lane is pitch black after 7 PM, raising safety concerns.",
    category: "broken_streetlight",
    status: "resolved",
    priority: "medium",
    verificationStatus: "authority_verified",
    reportedBy: "citizen_blr_04",
    reporterName: "Sunita Deshpande",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9307, lng: 77.5832 },
      address: "38th Cross Rd, Jayanagar 5th Block, Bengaluru, Karnataka",
      locality: "Jayanagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560041"
    },
    aiClassification: {
      category: "broken_streetlight",
      confidence: 0.98,
      suggestedPriority: "medium",
      tags: ["security", "lighting", "safety"],
      reasoning: "Residential street light outage increases burglary risk. Rated medium priority as it is a secondary avenue road.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bescom", departmentCode: "BESCOM", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 18, downvoteCount: 0, commentCount: 3, viewCount: 65, shareCount: 2, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(5) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BESCOM Maintenance", actor: "ai_agent", timestamp: createMockDate(5) },
      { id: "e3", type: "assigned", description: "Maintenance ticket opened", actor: "system", timestamp: createMockDate(4) },
      { id: "e4", type: "resolved", description: "Bulb replaced and light verified functional", actor: "authority", timestamp: createMockDate(1) }
    ],
    createdAt: createMockDate(5),
    updatedAt: createMockDate(1),
    resolvedAt: createMockDate(1),
    tags: ["security", "lighting", "safety"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_leak_005",
    title: "High-pressure municipal water line leakage on main road",
    description: "Substantial clean drinking water bubbling up from under the road surface, flooding the intersection. Thousands of liters of water wasted.",
    category: "water_leak",
    status: "assigned",
    priority: "high",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_05",
    reporterName: "Vikram Sen",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9698, lng: 77.7499 },
      address: "Whitefield Main Road, near Hope Farm Junction, Whitefield, Bengaluru, Karnataka",
      locality: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066"
    },
    aiClassification: {
      category: "water_leak",
      confidence: 0.95,
      suggestedPriority: "high",
      tags: ["water-waste", "pipeline-burst", "utility-failure"],
      reasoning: "Major utility drinking water pipe burst, causing local flooding and resource waste. High priority.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bwssb", departmentCode: "BWSSB", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 34, downvoteCount: 0, commentCount: 1, viewCount: 92, shareCount: 3, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(1.5) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BWSSB Water Supply Division", actor: "ai_agent", timestamp: createMockDate(1.5) },
      { id: "e3", type: "assigned", description: "Assigned to BWSSB emergency repair team", actor: "system", timestamp: createMockDate(0.5) }
    ],
    createdAt: createMockDate(1.5),
    updatedAt: createMockDate(0.5),
    tags: ["water-waste", "pipeline-burst", "utility-failure"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_road_006",
    title: "Severe asphalt peeling and road damage",
    description: "Top layer of asphalt completely worn off. Gravel and dust flying. Causes vehicle skidding, especially at night.",
    category: "damaged_road",
    status: "in_progress",
    priority: "critical",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_06",
    reporterName: "Rohan Das",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9738, lng: 77.6119 },
      address: "MG Road, near Metro Station, Bengaluru, Karnataka",
      locality: "MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001"
    },
    aiClassification: {
      category: "damaged_road",
      confidence: 0.96,
      suggestedPriority: "critical",
      tags: ["road-hazard", "asphalt-peeled", "metropolitan"],
      reasoning: "Major structural road damage in prime commercial zone. High accident risk for traffic.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_pwd", departmentCode: "PWD", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 55, downvoteCount: 1, commentCount: 5, viewCount: 180, shareCount: 15, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(3) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to PWD Highway Division", actor: "ai_agent", timestamp: createMockDate(3) },
      { id: "e3", type: "status_changed", description: "Marked In Progress. Road resurfacing scheduled.", actor: "authority", timestamp: createMockDate(1) }
    ],
    createdAt: createMockDate(3),
    updatedAt: createMockDate(1),
    tags: ["road-hazard", "asphalt-peeled", "metropolitan"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_pothole_007",
    title: "Double pothole outside commercial IT park entrance",
    description: "Two closely spaced deep potholes outside the IT park gates. Cars are braking suddenly, causing traffic tailbacks.",
    category: "pothole",
    status: "pending",
    priority: "high",
    verificationStatus: "unverified",
    reportedBy: "citizen_blr_07",
    reporterName: "Simran Kaur",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.8452, lng: 77.6636 },
      address: "Electronic City Phase 1, near main gate, Electronic City, Bengaluru, Karnataka",
      locality: "Electronic City",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100"
    },
    aiClassification: {
      category: "pothole",
      confidence: 0.91,
      suggestedPriority: "high",
      tags: ["pothole", "traffic-congestion", "it-corridor"],
      reasoning: "Road degradation outside high-volume corporate campus. Restricts transit and causes peak hour congestion.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_pwd", departmentCode: "PWD", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 14, downvoteCount: 0, commentCount: 0, viewCount: 50, shareCount: 1, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(0.1) }
    ],
    createdAt: createMockDate(0.1),
    updatedAt: createMockDate(0.1),
    tags: ["pothole", "traffic-congestion", "it-corridor"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_light_008",
    title: "Streetlight outage on dark residential cross road",
    description: "Third streetlight pole in the row is dead. Very dark near park entrance, creating unsafe walking conditions.",
    category: "broken_streetlight",
    status: "assigned",
    priority: "medium",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_08",
    reporterName: "Nisha Rao",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9250, lng: 77.5460 },
      address: "12th Main Rd, Banashankari 3rd Stage, Bengaluru, Karnataka",
      locality: "Banashankari",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560085"
    },
    aiClassification: {
      category: "broken_streetlight",
      confidence: 0.93,
      suggestedPriority: "medium",
      tags: ["lighting", "safety", "residential"],
      reasoning: "Flickering/dead light in residential street. Assigned medium priority based on location statistics.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bescom", departmentCode: "BESCOM", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 10, downvoteCount: 0, commentCount: 0, viewCount: 30, shareCount: 0, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(2.5) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BESCOM Maintenance", actor: "ai_agent", timestamp: createMockDate(2.5) },
      { id: "e3", type: "assigned", description: "Maintenance ticket opened", actor: "system", timestamp: createMockDate(1.5) }
    ],
    createdAt: createMockDate(2.5),
    updatedAt: createMockDate(1.5),
    tags: ["lighting", "safety", "residential"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_sewage_009",
    title: "Sewage pipeline leakage flooding storm water drain",
    description: "Raw sewage leaking from connecting chamber directly into the storm water channel. Extreme stench throughout the layout.",
    category: "sewage",
    status: "resolved",
    priority: "high",
    verificationStatus: "authority_verified",
    reportedBy: "citizen_blr_09",
    reporterName: "Kabir Mehta",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 13.0350, lng: 77.5970 },
      address: "Outer Ring Rd, Hebbal, Bengaluru, Karnataka",
      locality: "Hebbal",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560024"
    },
    aiClassification: {
      category: "sewage",
      confidence: 0.94,
      suggestedPriority: "high",
      tags: ["sewage", "drainage-leakage", "stench"],
      reasoning: "Active sewer leak into local storm water channel. Requires sanitation intervention. Dispatched high priority.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bwssb", departmentCode: "BWSSB", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 22, downvoteCount: 0, commentCount: 1, viewCount: 55, shareCount: 2, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(4) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BWSSB", actor: "ai_agent", timestamp: createMockDate(4) },
      { id: "e3", type: "assigned", description: "Engineer team dispatched", actor: "system", timestamp: createMockDate(3) },
      { id: "e4", type: "resolved", description: "Sewer leak patched and channel disinfected", actor: "authority", timestamp: createMockDate(1) }
    ],
    createdAt: createMockDate(4),
    updatedAt: createMockDate(1),
    resolvedAt: createMockDate(1),
    tags: ["sewage", "drainage-leakage", "stench"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_garbage_010",
    title: "Unattended municipal garbage dump accumulating near school",
    description: "A growing dump of trash directly opposite the primary school wall. Attracting rats and stray cattle, sanitarily unsafe.",
    category: "garbage_overflow",
    status: "under_review",
    priority: "high",
    verificationStatus: "unverified",
    reportedBy: "citizen_blr_10",
    reporterName: "Siddharth Sen",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 13.1000, lng: 77.5960 },
      address: "NES Office Rd, Yelahanka New Town, Bengaluru, Karnataka",
      locality: "Yelahanka",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560064"
    },
    aiClassification: {
      category: "garbage_overflow",
      confidence: 0.95,
      suggestedPriority: "high",
      tags: ["garbage", "health-hazard", "near-school"],
      reasoning: "SWM garbage accumulation outside institutional premises. Poses sanitization hazards for students.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bbmp", departmentCode: "BBMP", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 16, downvoteCount: 0, commentCount: 0, viewCount: 40, shareCount: 1, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(0.5) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BBMP SWM", actor: "ai_agent", timestamp: createMockDate(0.5) }
    ],
    createdAt: createMockDate(0.5),
    updatedAt: createMockDate(0.5),
    tags: ["garbage", "health-hazard", "near-school"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_leak_011",
    title: "Broken drinking water valve wasting water",
    description: "Sub-surface water pipe leaking, causing water pooling on side lane. Clean water running waste for 2 days.",
    category: "water_leak",
    status: "in_progress",
    priority: "high",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_11",
    reporterName: "Anil Kumble",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9320, lng: 77.6120 },
      address: "1st Cross Rd, Koramangala 6th Block, Bengaluru, Karnataka",
      locality: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560095"
    },
    aiClassification: {
      category: "water_leak",
      confidence: 0.92,
      suggestedPriority: "high",
      tags: ["water-waste", "leakage", "utility"],
      reasoning: "Clean domestic water supply leakage. High priority to prevent community water volume depletion.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bwssb", departmentCode: "BWSSB", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 20, downvoteCount: 0, commentCount: 1, viewCount: 48, shareCount: 0, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(2) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BWSSB", actor: "ai_agent", timestamp: createMockDate(2) },
      { id: "e3", type: "status_changed", description: "Status changed to In Progress. Leak inspection team dispatched.", actor: "authority", timestamp: createMockDate(1) }
    ],
    createdAt: createMockDate(2),
    updatedAt: createMockDate(1),
    tags: ["water-waste", "leakage", "utility"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_pothole_012",
    title: "Broad road pothole near bus terminal exit",
    description: "Wide pothole located directly in front of the exit gate of Indiranagar metro station bus bay. Forces buses to swerve.",
    category: "pothole",
    status: "under_review",
    priority: "critical",
    verificationStatus: "unverified",
    reportedBy: "citizen_blr_12",
    reporterName: "Pooja Hegde",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9710, lng: 77.6480 },
      address: "Indiranagar Double Road, Indiranagar, Bengaluru, Karnataka",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038"
    },
    aiClassification: {
      category: "pothole",
      confidence: 0.94,
      suggestedPriority: "critical",
      tags: ["pothole", "transit-risk", "major-corridor"],
      reasoning: "Critical pothole obstructing public transport bus channels. High risk of heavy vehicle damage and traffic blocking.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_pwd", departmentCode: "PWD", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 38, downvoteCount: 0, commentCount: 2, viewCount: 110, shareCount: 8, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(0.5) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to PWD", actor: "ai_agent", timestamp: createMockDate(0.5) }
    ],
    createdAt: createMockDate(0.5),
    updatedAt: createMockDate(0.5),
    tags: ["pothole", "transit-risk", "major-corridor"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_road_013",
    title: "Unfinished trench construction blocking road lane",
    description: "Digging done by service agency left open. No safety signs or barricades placed around the gravel mound.",
    category: "damaged_road",
    status: "assigned",
    priority: "high",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_13",
    reporterName: "Rahul Dravid",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9150, lng: 77.6350 },
      address: "14th Main Rd, Sector 4, HSR Layout, Bengaluru, Karnataka",
      locality: "HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102"
    },
    aiClassification: {
      category: "damaged_road",
      confidence: 0.93,
      suggestedPriority: "high",
      tags: ["road-hazard", "open-trench", "safety-risk"],
      reasoning: "Unfinished infrastructure excavation left unbarricaded. Poses critical road safety hazards at night.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_pwd", departmentCode: "PWD", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 24, downvoteCount: 0, commentCount: 1, viewCount: 50, shareCount: 3, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(1) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to PWD Infrastructure", actor: "ai_agent", timestamp: createMockDate(1) },
      { id: "e3", type: "assigned", description: "Inspection and safety citation issued", actor: "system", timestamp: createMockDate(0.5) }
    ],
    createdAt: createMockDate(1),
    updatedAt: createMockDate(0.5),
    tags: ["road-hazard", "open-trench", "safety-risk"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_sewage_014",
    title: "Blocked manhole overflowing sewage onto main ring road",
    description: "Raw sewage erupting from main road manhole. Flooding two lanes of Electronic City bypass link.",
    category: "sewage",
    status: "in_progress",
    priority: "critical",
    verificationStatus: "community_verified",
    reportedBy: "citizen_blr_14",
    reporterName: "Nandan Nilekani",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.8510, lng: 77.6590 },
      address: "Hosur Road, Electronic City Phase 2, Electronic City, Bengaluru, Karnataka",
      locality: "Electronic City",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100"
    },
    aiClassification: {
      category: "sewage",
      confidence: 0.95,
      suggestedPriority: "critical",
      tags: ["sewage", "major-highway", "sanitation-disaster"],
      reasoning: "Sewer backflow flooding highway arterial. Requires immediate industrial jetting. Dispatched critical.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bwssb", departmentCode: "BWSSB", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 46, downvoteCount: 0, commentCount: 3, viewCount: 140, shareCount: 10, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(2) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BWSSB Sewer Blockage team", actor: "ai_agent", timestamp: createMockDate(2) },
      { id: "e3", type: "status_changed", description: "Status changed to In Progress. Jetting machines dispatched.", actor: "authority", timestamp: createMockDate(1.2) }
    ],
    createdAt: createMockDate(2),
    updatedAt: createMockDate(1.2),
    tags: ["sewage", "major-highway", "sanitation-disaster"],
    isPublic: true,
    source: "web"
  },
  {
    id: "mock_light_015",
    title: "Entire row of streetlights out on park periphery road",
    description: "6 consecutive streetlight bulbs are out along the park walkway. The whole block is completely dark and unsafe.",
    category: "broken_streetlight",
    status: "resolved",
    priority: "medium",
    verificationStatus: "authority_verified",
    reportedBy: "citizen_blr_15",
    reporterName: "Sudha Murty",
    isAnonymous: false,
    imageURLs: [],
    location: {
      geoPoint: { lat: 12.9240, lng: 77.5910 },
      address: "11th Main Rd, Jayanagar 3rd Block East, Bengaluru, Karnataka",
      locality: "Jayanagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560011"
    },
    aiClassification: {
      category: "broken_streetlight",
      confidence: 0.94,
      suggestedPriority: "medium",
      tags: ["lighting", "public-safety", "park-area"],
      reasoning: "Consecutive pole lighting failure in prominent park residential walk. Medium priority to address commercial-residential security.",
      processedAt: Timestamp.now(),
      modelVersion: "gemini-2.5-flash"
    },
    routing: { authorityId: "auth_bescom", departmentCode: "BESCOM", assignedAt: Timestamp.now(), assignedBy: "ai", escalated: false },
    engagement: { upvoteCount: 21, downvoteCount: 0, commentCount: 1, viewCount: 50, shareCount: 1, upvotedBy: [] },
    timeline: [
      { id: "e1", type: "created", description: "Issue reported by citizen", actor: "citizen", timestamp: createMockDate(6) },
      { id: "e2", type: "ai_processed", description: "AI auto-routed to BESCOM Maintenance", actor: "ai_agent", timestamp: createMockDate(6) },
      { id: "e3", type: "assigned", description: "Assigned to sector line crew", actor: "system", timestamp: createMockDate(5) },
      { id: "e4", type: "resolved", description: "Power line fuse replaced and lights verified active", actor: "authority", timestamp: createMockDate(2) }
    ],
    createdAt: createMockDate(6),
    updatedAt: createMockDate(2),
    resolvedAt: createMockDate(2),
    tags: ["lighting", "public-safety", "park-area"],
    isPublic: true,
    source: "web"
  }
];
