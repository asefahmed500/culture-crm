
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ICustomerProfile extends Document {
  ageRange: string;
  spendingLevel: string;
  purchaseCategories: string[];
  interactionFrequency: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema: Schema<ICustomerProfile> = new Schema({
  ageRange: { type: String, required: false },
  spendingLevel: { type: String, required: false },
  purchaseCategories: { type: [String], required: false },
  interactionFrequency: { type: String, required: false },
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

const CustomerProfile = (models.CustomerProfile as Model<ICustomerProfile>) || mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
export default CustomerProfile;
