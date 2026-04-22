import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Listing from "./models/Listing.js";
import Note from "./models/Note.js";
import LendItem from "./models/LendItem.js";
import BorrowRequest from "./models/BorrowRequest.js";
import Message from "./models/Message.js";

const { MONGO_URI } = process.env;
if (!MONGO_URI) { console.error("❌  MONGO_URI not set in .env"); process.exit(1); }

// ─── image banks (Unsplash sourced, category-specific) ─────────────────────
const IMG = {
  textbook: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80",
    "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&q=80",
  ],
  calculator: [
    "https://images.unsplash.com/photo-1611125575702-db0b1cd6c3bd?w=600&q=80",
    "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?w=600&q=80",
    "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&q=80",
  ],
  lab: [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80",
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80",
    "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80",
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600&q=80",
  ],
  electronics: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80",
    "https://images.unsplash.com/photo-1600490036275-53b7a9ef3fb5?w=600&q=80",
    "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80",
    "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80",
    "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80",
  ],
  stationery: [
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  ],
  other: [
    "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=600&q=80",
    "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=600&q=80",
  ],
  lend_calc: [
    "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?w=600&q=80",
    "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&q=80",
  ],
  lend_elec: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80",
  ],
  lend_books: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
  ],
  lend_lab: [
    "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80",
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600&q=80",
  ],
  lend_tools: [
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickTwo = (arr) => {
  const a = Math.floor(Math.random() * arr.length);
  const b = (a + 1) % arr.length;
  return [arr[a], arr[b]];
};

// ─── users ─────────────────────────────────────────────────────────────────
const RAW_USERS = [
  { name: "Aarav Mehta",      email: "aarav.mehta@sot.pdpu.ac.in",      department: "CS",  year: 3 },
  { name: "Priya Sharma",     email: "priya.sharma@sot.pdpu.ac.in",     department: "EC",  year: 2 },
  { name: "Rohan Patel",      email: "rohan.patel@sot.pdpu.ac.in",      department: "ME",  year: 4 },
  { name: "Sneha Joshi",      email: "sneha.joshi@sot.pdpu.ac.in",      department: "CE",  year: 1 },
  { name: "Karan Desai",      email: "karan.desai@sot.pdpu.ac.in",      department: "CH",  year: 3 },
  { name: "Ananya Singh",     email: "ananya.singh@sot.pdpu.ac.in",     department: "BT",  year: 2 },
  { name: "Vivek Gupta",      email: "vivek.gupta@sot.pdpu.ac.in",      department: "ICT", year: 4 },
  { name: "Nisha Verma",      email: "nisha.verma@sot.pdpu.ac.in",      department: "EE",  year: 1 },
  { name: "Dev Trivedi",      email: "dev.trivedi@sot.pdpu.ac.in",      department: "CS",  year: 2 },
  { name: "Riya Kothari",     email: "riya.kothari@sot.pdpu.ac.in",     department: "ME",  year: 3 },
  { name: "Arjun Shah",       email: "arjun.shah@sot.pdpu.ac.in",       department: "CS",  year: 1 },
  { name: "Pooja Yadav",      email: "pooja.yadav@sot.pdpu.ac.in",      department: "EC",  year: 4 },
  { name: "Mihir Chauhan",    email: "mihir.chauhan@sot.pdpu.ac.in",    department: "ME",  year: 2 },
  { name: "Tanvi Bhatia",     email: "tanvi.bhatia@sot.pdpu.ac.in",     department: "BT",  year: 3 },
  { name: "Nikhil Agarwal",   email: "nikhil.agarwal@sot.pdpu.ac.in",   department: "CE",  year: 4 },
  { name: "Kriti Pandey",     email: "kriti.pandey@sot.pdpu.ac.in",     department: "CH",  year: 2 },
  { name: "Siddharth Rao",    email: "siddharth.rao@sot.pdpu.ac.in",    department: "ICT", year: 1 },
  { name: "Ishu Malhotra",    email: "ishu.malhotra@sot.pdpu.ac.in",    department: "EE",  year: 3 },
  { name: "Aditya Kumar",     email: "aditya.kumar@sot.pdpu.ac.in",     department: "CS",  year: 4 },
  { name: "Zara Sheikh",      email: "zara.sheikh@sot.pdpu.ac.in",      department: "BT",  year: 1 },
];

// ─── listings (30 items) ────────────────────────────────────────────────────
const LISTING_DATA = [
  // textbooks
  { title: "Engineering Mathematics Vol. 1 — B.S. Grewal",        description: "Slightly worn cover, pages clean, no markings. Perfect for Sem 2 maths.", price: 180, mrp: 650,  condition: "good",  category: "textbook",   department: "CS",  semester: 2 },
  { title: "Engineering Mathematics Vol. 2 — B.S. Grewal",        description: "Minor pencil marks in chapter 9 only, else pristine.",                       price: 170, mrp: 650,  condition: "fair",  category: "textbook",   department: "ME",  semester: 3 },
  { title: "Fluid Mechanics — R.K. Bansal",                        description: "Used for one semester by a topper. Excellent reference for exams.",          price: 200, mrp: 500,  condition: "good",  category: "textbook",   department: "ME",  semester: 4 },
  { title: "Strength of Materials — R.K. Bansal",                  description: "A must-have for CE students. Solved examples with clear diagrams.",          price: 210, mrp: 520,  condition: "good",  category: "textbook",   department: "CE",  semester: 3 },
  { title: "Data Structures & Algorithms — CLRS (Hardcover)",      description: "Flagship DS textbook. No highlights, binding intact. Rare find at this price.", price: 600, mrp: 1400, condition: "good",  category: "textbook",   department: "CS",  semester: 3 },
  { title: "Organic Chemistry — Morrison & Boyd",                   description: "Classic reference. Minor pencil marks, all erasable.",                        price: 350, mrp: 900,  condition: "fair",  category: "textbook",   department: "BT",  semester: 3 },
  { title: "Analog Electronics — Sedra & Smith",                   description: "6th edition. Great for EC Sem 4. Highlighter in Chapter 3 only.",            price: 400, mrp: 950,  condition: "fair",  category: "textbook",   department: "EC",  semester: 4 },
  { title: "Thermodynamics — P.K. Nag",                            description: "Complete book in great condition. Used for two semesters.",                   price: 250, mrp: 600,  condition: "good",  category: "textbook",   department: "ME",  semester: 4 },
  { title: "Digital Logic Design — Morris Mano",                   description: "Excellent condition. All K-maps and truth tables untouched.",                  price: 280, mrp: 700,  condition: "new",   category: "textbook",   department: "EC",  semester: 2 },
  { title: "Signals & Systems — Oppenheim & Schafer",              description: "For DSP course. A few solved exercises marked.",                               price: 320, mrp: 750,  condition: "fair",  category: "textbook",   department: "EC",  semester: 5 },
  { title: "Geotechnical Engineering — Arora",                     description: "Barely used. Soil mechanics and foundation design fully covered.",             price: 220, mrp: 490,  condition: "new",   category: "textbook",   department: "CE",  semester: 5 },
  { title: "Biochemistry — Lehninger (Principles)",                description: "8th edition. Very clean. Good for BT 5th sem.",                               price: 550, mrp: 1300, condition: "good",  category: "textbook",   department: "BT",  semester: 5 },

  // calculators
  { title: "Casio FX-991EX Scientific Calculator",                 description: "All functions perfect including QR and spreadsheet mode. Comes with cover.", price: 750, mrp: 1250, condition: "good",  category: "calculator", department: "CS",  semester: 1 },
  { title: "Casio FX-82MS Scientific Calculator",                  description: "Budget pick. Works flawlessly. Slightly scratched casing.",                   price: 280, mrp: 600,  condition: "fair",  category: "calculator", department: "ME",  semester: 1 },
  { title: "Casio FX-350ES Plus",                                  description: "Good for basic engineering. Battery just replaced.",                            price: 220, mrp: 500,  condition: "good",  category: "calculator", department: "CE",  semester: 1 },

  // lab
  { title: "White Lab Coat (Size L)",                              description: "Washed and clean. Good for chemistry or biology labs.",                        price: 120, mrp: 350,  condition: "fair",  category: "lab",        department: "CH",  semester: 2 },
  { title: "Safety Goggles (Clear Lens)",                         description: "Anti-fog, anti-scratch. Used only once. Nearly new.",                          price: 60,  mrp: 180,  condition: "good",  category: "lab",        department: "BT",  semester: 2 },
  { title: "Digital Vernier Caliper 150mm",                        description: "Professional grade. Accurate to 0.01mm. Rarely used. All accessories included.", price: 400, mrp: 850,  condition: "good",  category: "lab",        department: "ME",  semester: 3 },
  { title: "Dissection Kit (9-piece)",                             description: "Complete set. Pins, scalpel, forceps, scissors — all present.",                 price: 90,  mrp: 220,  condition: "good",  category: "lab",        department: "BT",  semester: 1 },

  // electronics
  { title: "Arduino Uno R3 + Starter Kit",                         description: "40-piece kit: sensors, LEDs, LCD, breadboard. Perfect for STEM projects.",    price: 450, mrp: 1100, condition: "good",  category: "electronics", department: "CS",  semester: 4 },
  { title: "Raspberry Pi 4 Model B (4GB)",                         description: "Selling after project submission. Excellent condition with 5V power adapter.", price: 2800, mrp: 4200, condition: "good", category: "electronics", department: "ICT", semester: 6 },
  { title: "ESP8266 NodeMCU Dev Board (×3)",                       description: "Pack of 3 WiFi boards. Tested and working. Good for IoT projects.",            price: 250, mrp: 600,  condition: "good",  category: "electronics", department: "EC",  semester: 4 },
  { title: "Digital Multimeter — Fluke 101",                       description: "Entry-level Fluke. Accurate AC/DC readings. Battery good for months.",        price: 700, mrp: 1500, condition: "good",  category: "electronics", department: "EE",  semester: 3 },
  { title: "Breadboard + Jumper Wire Kit (×2 boards)",             description: "400-point breadboards with 120-piece jumper wire set.",                        price: 150, mrp: 350,  condition: "new",   category: "electronics", department: "CS",  semester: 2 },
  { title: "Soldering Iron Station — Adjustable 60W",              description: "Temperature-controlled. Comes with solder wire and tip cleaner.",              price: 600, mrp: 1200, condition: "good",  category: "electronics", department: "ME",  semester: 4 },

  // stationery
  { title: "Drawing Instruments Set (Staedtler)",                  description: "Compass, divider, scales, French curves — complete. Used 1 sem.",             price: 90,  mrp: 220,  condition: "good",  category: "stationery", department: "CE",  semester: 1 },
  { title: "Graph Notebooks A4 (Pack of 6)",                       description: "Sealed pack. 1mm squares. Useful for CE/ME drawing assignments.",             price: 70,  mrp: 150,  condition: "new",   category: "stationery", department: "ME",  semester: 1 },
  { title: "Staedtler Mars Mechanical Pencil Set",                 description: "0.3, 0.5, 0.7mm pencils + extra leads. Excellent for engineering drawings.",  price: 180, mrp: 420,  condition: "good",  category: "stationery", department: "CE",  semester: 2 },

  // other
  { title: "Adjustable Study Lamp (USB + Battery)",                description: "3 brightness levels, flexible neck. Works great for night study sessions.",    price: 300, mrp: 650,  condition: "good",  category: "other",      department: "CS",  semester: 1 },
  { title: "Mini Whiteboard 40×30cm + Markers",                   description: "Great for making study boards. Comes with eraser and 4 marker colours.",       price: 200, mrp: 450,  condition: "good",  category: "other",      department: "ICT", semester: 1 },
];

// ─── notes (20 items) ──────────────────────────────────────────────────────
// Verified working PDF URLs (all return HTTP 200 application/pdf)
const NOTE_PDFS = [
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",   // CS — real PLDI paper
  "https://www.orimi.com/pdf-test.pdf",                                           // sample doc
  "https://filesamples.com/samples/document/pdf/sample1.pdf",                    // sample doc
  "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf",
  "https://research.nhm.org/pdfs/10840/10840.pdf",                               // NHM research paper
];

const NOTE_DATA = [
  // CS
  { title: "Data Structures & Algorithms — Complete Sem 3 Notes",              description: "Covers arrays, linked lists, trees, graphs, sorting algorithms with solved examples. Based on CLRS.",  subject: "Data Structures",          department: "CS",  semester: 3, type: "notes",     downloads: 128 },
  { title: "Operating Systems — All Units (Typed + Handwritten)",               description: "Process scheduling, memory management, file systems, deadlock, paging. Comprehensive exam-ready notes.", subject: "Operating Systems",        department: "CS",  semester: 5, type: "notes",     downloads: 96  },
  { title: "Database Management Systems — Full Notes",                          description: "ER diagrams, normalisation (1NF–BCNF), SQL queries with practice problems.",                            subject: "DBMS",                     department: "CS",  semester: 4, type: "notes",     downloads: 74  },
  { title: "DBMS PYQs 2019–2024 with Solutions",                               description: "5 years of university exam papers for DBMS. Fully solved with explanation.",                            subject: "DBMS",                     department: "CS",  semester: 4, type: "pyq",       downloads: 210 },
  { title: "Computer Networks — OSI Model & Protocols",                        description: "Detailed notes on OSI layers, TCP/IP, routing algorithms, error correction codes.",                     subject: "Computer Networks",        department: "CS",  semester: 6, type: "notes",     downloads: 83  },
  { title: "CN PYQs 2020–2024",                                                description: "Previous year papers with solved answers for PDEU Computer Networks exam.",                              subject: "Computer Networks",        department: "CS",  semester: 6, type: "pyq",       downloads: 165 },

  // EC
  { title: "Analog Electronics — Unit 4 & 5 Assignment",                       description: "Solved assignment covering op-amp circuits, feedback amplifiers, oscillators. Neat circuit diagrams.",  subject: "Analog Electronics",       department: "EC",  semester: 3, type: "assignment", downloads: 59  },
  { title: "Digital Signal Processing — Complete Notes",                       description: "DFT, FFT, Z-transform, FIR/IIR filter design. All important derivations included.",                    subject: "DSP",                      department: "EC",  semester: 5, type: "notes",     downloads: 91  },
  { title: "DSP PYQs 2021–2024 with Solutions",                                description: "4 years university exam papers with full solved answers and key formulae.",                              subject: "DSP",                      department: "EC",  semester: 5, type: "pyq",       downloads: 177 },
  { title: "Electromagnetic Fields — All Units",                                description: "Maxwell's equations, wave propagation, transmission lines. Diagrams drawn clearly.",                    subject: "EM Fields",                department: "EC",  semester: 4, type: "notes",     downloads: 62  },

  // ME
  { title: "Engineering Thermodynamics — Units 1–5",                           description: "Laws of thermodynamics, Rankine & Brayton cycles, refrigeration. Solved previous year problems included.", subject: "Thermodynamics",           department: "ME",  semester: 4, type: "notes",     downloads: 105 },
  { title: "Thermo PYQs 2019–2024 (Fully Solved)",                             description: "5 complete university exam papers with step-by-step solutions.",                                        subject: "Thermodynamics",           department: "ME",  semester: 4, type: "pyq",       downloads: 199 },
  { title: "Theory of Machines — Kinematics Notes",                            description: "Mechanisms, velocity and acceleration diagrams, cams and followers. Hand-drawn diagrams.",              subject: "Theory of Machines",       department: "ME",  semester: 5, type: "notes",     downloads: 47  },

  // CE
  { title: "Structural Analysis — Mini-Project Report",                        description: "Group project: beam analysis using STAAD Pro. Includes design calculations and results.",               subject: "Structural Analysis",      department: "CE",  semester: 5, type: "project",   downloads: 38  },
  { title: "Concrete Technology — Notes & PYQs",                               description: "Mix design, properties of concrete, admixtures, IS code references added.",                              subject: "Concrete Technology",      department: "CE",  semester: 4, type: "notes",     downloads: 52  },

  // BT
  { title: "Biochemistry — Enzyme Kinetics & Metabolism",                      description: "Module 2 detailed notes. Michaelis-Menten kinetics, TCA cycle, electron transport chain.",            subject: "Biochemistry",             department: "BT",  semester: 2, type: "notes",     downloads: 44  },
  { title: "Microbiology — Unit 3 Assignment (Solved)",                        description: "Growth kinetics, sterilisation techniques, fermentation. Well-labelled diagrams.",                      subject: "Microbiology",             department: "BT",  semester: 3, type: "assignment", downloads: 33  },

  // ICT
  { title: "Web Technology — HTML, CSS, JS Quick Reference",                   description: "Compact cheat sheet + notes for Web Tech exam. Covers all exam-relevant topics.",                       subject: "Web Technology",           department: "ICT", semester: 4, type: "notes",     downloads: 133 },
  { title: "Information Security — Cryptography Notes",                        description: "RSA, AES, DES, digital signatures, PKI infrastructure. All algorithms with examples.",                  subject: "Information Security",     department: "ICT", semester: 6, type: "notes",     downloads: 77  },
  { title: "Software Engineering — SDLC & UML Complete Notes",                 description: "All SDLC models, UML diagrams (use case, sequence, class, activity), testing techniques.",              subject: "Software Engineering",     department: "ICT", semester: 5, type: "notes",     downloads: 88  },
];

// ─── lend items (15 items) ─────────────────────────────────────────────────
const LEND_ITEM_DATA = [
  { title: "TI-84 Plus Graphing Calculator",         description: "Perfect for Numerical Methods and any graph-plotting exam. Battery fresh.",          category: "calculator",  department: "CS",  maxDuration: 7,  images: pickTwo(IMG.lend_calc)  },
  { title: "Casio FX-991EX (Higher-end calc)",       description: "Lend for mids/end-sems. 300+ functions. Will not lend beyond a week.",               category: "calculator",  department: "ME",  maxDuration: 5,  images: pickTwo(IMG.lend_calc)  },
  { title: "Digital Multimeter — Fluke 107",         description: "Accurate DMM. For electronics lab or project troubleshooting.",                       category: "electronics", department: "EC",  maxDuration: 5,  images: pickTwo(IMG.lend_elec)  },
  { title: "Raspberry Pi 4 (4GB RAM)",               description: "For short-term project prototyping only. Must return with original accessories.",      category: "electronics", department: "ICT", maxDuration: 10, images: pickTwo(IMG.lend_elec)  },
  { title: "Arduino Uno Kit",                         description: "Starter kit with 40 components. Just make sure nothing falls out.",                   category: "electronics", department: "CS",  maxDuration: 7,  images: pickTwo(IMG.lend_elec)  },
  { title: "Oscilloscope (Rigol DS1054Z)",           description: "100MHz digital scope. Lend for lab project submissions only. Handle carefully.",      category: "electronics", department: "EE",  maxDuration: 3,  images: pickTwo(IMG.lend_elec)  },
  { title: "Textbook: CLRS — Intro to Algorithms",   description: "Lend for 2 weeks. Read-only — please don't write or dog-ear.",                        category: "books",       department: "CS",  maxDuration: 14, images: pickTwo(IMG.lend_books) },
  { title: "Textbook: P.K. Nag Thermodynamics",      description: "Classic reference. Will lend for one exam week only.",                                 category: "books",       department: "ME",  maxDuration: 7,  images: pickTwo(IMG.lend_books) },
  { title: "Textbook: Geotechnical Engg — Arora",   description: "Good condition. For CE students doing soil mechanics project.",                         category: "books",       department: "CE",  maxDuration: 10, images: pickTwo(IMG.lend_books) },
  { title: "White Lab Coat (Size M)",                description: "Clean and ironed. Available for chem/bio lab when yours is being washed.",             category: "lab",         department: "CH",  maxDuration: 3,  images: pickTwo(IMG.lend_lab)   },
  { title: "Safety Goggles (Anti-fog)",              description: "Lend for lab days. Return the same day.",                                               category: "lab",         department: "BT",  maxDuration: 1,  images: pickTwo(IMG.lend_lab)   },
  { title: "Digital Vernier Caliper",                description: "Accurate to 0.01mm. Handle with care. Don't drop.",                                    category: "lab",         department: "ME",  maxDuration: 5,  images: pickTwo(IMG.lend_lab)   },
  { title: "SolidWorks USB License Dongle",          description: "SolidWorks 2023 standalone license. For project modelling — return within 10 days.",   category: "tools",       department: "ME",  maxDuration: 10, images: pickTwo(IMG.lend_tools) },
  { title: "Soldering Iron Station — 60W",           description: "Temperature controlled. Good for PCB work. Return with tip cleaned.",                  category: "tools",       department: "EC",  maxDuration: 4,  images: pickTwo(IMG.lend_tools) },
  { title: "HDMI to VGA Adapter",                   description: "For connecting laptops to older projectors in lecture halls.",                           category: "electronics", department: "ICT", maxDuration: 2,  images: pickTwo(IMG.lend_elec)  },
];

// ─── conversation pairs ────────────────────────────────────────────────────
const MESSAGE_PAIRS = [
  [0,1, "Hey Priya! Is your Casio FX-991EX still available? Need it for midsems."],
  [1,0, "Yes it is! When do you need it from?"],
  [0,1, "If possible from Sunday? My paper is Monday 9am."],
  [1,0, "Sure, I'll keep it ready. Come to CS Block Room 204."],
  [2,3, "Hi Sneha — your Drawing Instruments Set, is it the Staedtler one?"],
  [3,2, "Yes exactly! The full set minus the big compass, which I still need. But I can show you if you want."],
  [2,3, "That works. Can you share a photo in person? I'm in campus tomorrow."],
  [4,5, "Ananya, is your lab coat size M or L?"],
  [5,4, "It's M! Should fit fine for average build."],
  [4,5, "Perfect. I'll DM you on campus. What's your ask price?"],
  [6,7, "Hey Nisha, saw your Raspberry Pi listing. Is it Pi 4 or Pi 3?"],
  [7,6, "It's Pi 4, 4GB. Works perfectly. Selling because project is submitted."],
  [6,7, "Does it come with the SD card and power adapter?"],
  [7,6, "Yes — 32GB Samsung SD card + original 5V/3A adapter included."],
  [8,9, "Riya, is your Thermodynamics textbook P.K. Nag or Cengel?"],
  [9,8, "It's P.K. Nag, 8th edition. Super clean, no markings."],
  [8,9, "Great! Can we meet at the library Thursday?"],
  [9,8, "Sure, around 4pm works for me."],
  [10,11, "Pooja, how old is your multimeter? Does it measure capacitance?"],
  [11,10, "It's a Fluke 101 — measures V, A, R only. About 1.5 years old."],
];

// ─── main ──────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Connecting to MongoDB …");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected.\n");

  console.log("🗑   Clearing existing data …");
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Note.deleteMany({}),
    LendItem.deleteMany({}),
    BorrowRequest.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log("✅  Cleared.\n");

  // ── USERS ──────────────────────────────────────────────────────────────
  console.log("👤  Seeding users …");
  const hashedPassword = await bcrypt.hash("Password123", 10);
  const users = await User.insertMany(
    RAW_USERS.map((u) => ({
      ...u,
      password: hashedPassword,
      college: "PDEU Gandhinagar",
      isVerified: true,
      rating: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 30) + 2,
    }))
  );
  console.log(`   ✓ Created ${users.length} users.`);

  // ── LISTINGS ───────────────────────────────────────────────────────────
  console.log("🛒  Seeding marketplace listings …");
  const listings = await Listing.insertMany(
    LISTING_DATA.map((l, i) => ({
      ...l,
      seller: users[i % users.length]._id,
      images: pickTwo(IMG[l.category] || IMG.other),
      isAvailable: Math.random() > 0.1,
      interestedCount: Math.floor(Math.random() * 15),
    }))
  );
  console.log(`   ✓ Created ${listings.length} listings.`);

  // ── NOTES ──────────────────────────────────────────────────────────────
  console.log("📝  Seeding notes (with real PDF URLs) …");
  const notes = await Note.insertMany(
    NOTE_DATA.map((n, i) => ({
      ...n,
      uploader: users[i % users.length]._id,
      fileUrl:  NOTE_PDFS[i % NOTE_PDFS.length],
      fileType: "application/pdf",
    }))
  );
  console.log(`   ✓ Created ${notes.length} notes.`);

  // ── LEND ITEMS ─────────────────────────────────────────────────────────
  console.log("🔧  Seeding lend items …");
  const lendItems = await LendItem.insertMany(
    LEND_ITEM_DATA.map((item, i) => ({
      ...item,
      owner: users[i % users.length]._id,
      isAvailable: true,
    }))
  );
  console.log(`   ✓ Created ${lendItems.length} lend items.`);

  // ── BORROW REQUESTS ────────────────────────────────────────────────────
  console.log("📬  Seeding borrow requests …");
  const borrowRequests = await BorrowRequest.insertMany([
    {
      item: lendItems[0]._id, borrower: users[1]._id, owner: users[0]._id,
      duration: 3, message: "Need it for Numerical Methods midsem.",  status: "pending",
    },
    {
      item: lendItems[1]._id, borrower: users[2]._id, owner: users[1]._id,
      duration: 5, message: "Lab project — will return in perfect condition.", status: "approved",
      returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      item: lendItems[2]._id, borrower: users[3]._id, owner: users[2]._id,
      duration: 3, message: "Electronics lab assignment, will return Monday.", status: "returned",
    },
    {
      item: lendItems[5]._id, borrower: users[8]._id, owner: users[7]._id,
      duration: 2, message: "Need the oscilloscope for EE final lab.", status: "pending",
    },
    {
      item: lendItems[7]._id, borrower: users[9]._id, owner: users[8]._id,
      duration: 7, message: "One week for thermodynamics reference — promise!", status: "approved",
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      item: lendItems[12]._id, borrower: users[4]._id, owner: users[3]._id,
      duration: 10, message: "Final year project CAD work in SolidWorks.", status: "pending",
    },
  ]);
  console.log(`   ✓ Created ${borrowRequests.length} borrow requests.`);

  // Mark approved items as unavailable
  for (const req of borrowRequests.filter(r => r.status === "approved")) {
    await LendItem.findByIdAndUpdate(req.item, {
      isAvailable: false,
      currentBorrower: req.borrower,
      returnDate: req.returnDate,
    });
  }

  // ── MESSAGES ───────────────────────────────────────────────────────────
  console.log("💬  Seeding messages …");
  const messages = await Message.insertMany(
    MESSAGE_PAIRS.map(([si, ri, content], i) => ({
      sender:   users[si]._id,
      receiver: users[ri]._id,
      listing:  listings[i % listings.length]._id,
      content,
      isRead: Math.random() > 0.35,
    }))
  );
  console.log(`   ✓ Created ${messages.length} messages.\n`);

  // ── SUMMARY ────────────────────────────────────────────────────────────
  console.log("🎉  Database seeded successfully!\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("  Collection          Count");
  console.log("  ─────────────────   ─────");
  console.log(`  Users               ${users.length}`);
  console.log(`  Listings            ${listings.length}`);
  console.log(`  Notes               ${notes.length}`);
  console.log(`  Lend Items          ${lendItems.length}`);
  console.log(`  Borrow Requests     ${borrowRequests.length}`);
  console.log(`  Messages            ${messages.length}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("\n  Login any account with password: Password123");
  console.log("  Sample emails:");
  RAW_USERS.slice(0, 5).forEach(u => console.log(`    📧  ${u.email}`));
  console.log("  (and 15 more — see seed.js for the full list)\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
