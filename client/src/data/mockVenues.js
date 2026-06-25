/**
 * mockVenues.js — Sample venue data for frontend development
 *
 * Use this data when the backend is not yet connected.
 */

export const mockVenues = [
  {
    id: "venue-1",
    name: "Cine Adarna",
    location: "UP Film Institute, Magsaysay Ave, UP Diliman",
    capacity: 600,
    description:
      "A state-of-the-art cinema and performance venue located at the UP Film Institute. Ideal for film screenings, lectures, and cultural performances.",
    managingUnit: "UP Film Institute",
    amenities: ["Air Conditioning", "Sound System", "Projector", "Stage Lighting"],
    equipment: ["Microphone", "Podium", "Projector Screen"],
    rules: "No food or drinks inside the theater. Events must end by 10:00 PM.",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "venue-2",
    name: "Palma Hall 400",
    location: "Palma Hall (AS), UP Diliman",
    capacity: 200,
    description:
      "The largest lecture hall in Palma Hall, commonly used for general assemblies and academic conferences.",
    managingUnit: "College of Social Sciences and Philosophy",
    amenities: ["Air Conditioning", "Projector", "Whiteboard"],
    equipment: ["Microphone", "Laptop Stand", "Extension Cords"],
    rules: "Reserving party must provide their own technician for AV equipment.",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "venue-3",
    name: "CS Amphitheater",
    location: "Department of Computer Science, UP Diliman",
    capacity: 150,
    description:
      "An open-air amphitheater adjacent to the CS building. Great for informal events and outdoor presentations.",
    managingUnit: "Department of Computer Science",
    amenities: ["Open-Air Seating", "Power Outlets"],
    equipment: ["Portable Sound System"],
    rules: "Events are weather-dependent. No amplified music after 8:00 PM.",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "venue-4",
    name: "Melchor Hall Conference Room",
    location: "Melchor Hall, College of Engineering, UP Diliman",
    capacity: 40,
    description:
      "A compact, air-conditioned conference room. Suitable for meetings, thesis defenses, and small workshops.",
    managingUnit: "College of Engineering",
    amenities: ["Air Conditioning", "Projector", "Whiteboard", "Wi-Fi"],
    equipment: ["Conference Table", "Chairs", "Projector Screen"],
    rules: "Maximum of 40 persons. Please leave the room clean after use.",
    imageUrl: null,
    isActive: true,
  },
];
