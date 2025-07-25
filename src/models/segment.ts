
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ISegment extends Document {
  _id: string;
  segmentName: string;
  segmentSize: number;
  averageCustomerValue: string;
  topCulturalCharacteristics: string[];
  communicationPreferences: string;
  lovedProductCategories: string[];
  bestMarketingChannels: string[];
  sampleMessaging: string;
  potentialLifetimeValue: string;
  businessOpportunityRank: number;
  biasWarning?: string;
  actualROI?: number;
  comparisonROI?: number;
}

const SegmentSchema: Schema<ISegment> = new Schema({
  segmentName: { type: String, required: true },
  segmentSize: { type: Number, required: true },
  averageCustomerValue: { type: String, required: true },
  topCulturalCharacteristics: { type: [String], required: true },
  communicationPreferences: { type: String, required: true },
  lovedProductCategories: { type: [String], required: true },
  bestMarketingChannels: { type: [String], required: true },
  sampleMessaging: { type: String, required: true },
  potentialLifetimeValue: { type: String, required: true },
  businessOpportunityRank: { type: Number, required: true },
  biasWarning: { type: String, required: false },
  actualROI: { type: Number, required: false },
  comparisonROI: { type: Number, required: false },
}, {
    timestamps: true
});

const Segment = (models.Segment as Model<ISegment>) || mongoose.model<ISegment>('Segment', SegmentSchema);
export default Segment;
