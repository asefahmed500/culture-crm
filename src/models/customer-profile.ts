
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ICulturalDNA {
  music: { score: number; preferences: string[] };
  entertainment: { score: number; preferences: string[] };
  dining: { score: number; preferences: string[] };
  fashion: { score: number; preferences: string[] };
  travel: { score: number; preferences: string[] };
  socialCauses: { score: number; preferences:string[] };
  surpriseConnections: string[];
  confidenceScore: number;
}

export interface ICustomerProfile extends Document {
  ageRange: string;
  spendingLevel: string;
  purchaseCategories: string[];
  interactionFrequency: string;
  culturalDNA?: ICulturalDNA;
  createdAt: Date;
  updatedAt: Date;
}

const CulturalDNASchema: Schema<ICulturalDNA> = new Schema({
    music: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    entertainment: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    dining: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    fashion: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    travel: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    socialCauses: {
        score: { type: Number, default: 0 },
        preferences: { type: [String], default: [] }
    },
    surpriseConnections: { type: [String], default: [] },
    confidenceScore: { type: Number, default: 0 }
}, { _id: false });


const CustomerProfileSchema: Schema<ICustomerProfile> = new Schema({
  ageRange: { type: String, required: false },
  spendingLevel: { type: String, required: false },
  purchaseCategories: { type: [String], required: false },
  interactionFrequency: { type: String, required: false },
  culturalDNA: { type: CulturalDNASchema, required: false },
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

const CustomerProfile = (models.CustomerProfile as Model<ICustomerProfile>) || mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
export default CustomerProfile;
