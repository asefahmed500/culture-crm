
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ICampaign extends Document {
  targetSegment: string;
  campaignTitle: string;
  description: string;
  suggestedChannels: string[];
  createdAt: Date;
}

const CampaignSchema: Schema<ICampaign> = new Schema({
  targetSegment: { type: String, required: true },
  campaignTitle: { type: String, required: true },
  description: { type: String, required: true },
  suggestedChannels: { type: [String], required: true },
}, {
    timestamps: true
});

const Campaign = (models.Campaign as Model<ICampaign>) || mongoose.model<ICampaign>('Campaign', CampaignSchema);
export default Campaign;
