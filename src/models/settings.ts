import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ISettings extends Document {
  singleton: boolean; // Used to ensure only one settings document exists
  averageLTV: number;
  averageConversionRate: number;
  averageCPA: number;
  updatedAt: Date;
}

const SettingsSchema: Schema<ISettings> = new Schema({
  singleton: { type: Boolean, default: true, unique: true },
  averageLTV: { type: Number, default: 0 },
  averageConversionRate: { type: Number, default: 0 },
  averageCPA: { type: Number, default: 0 },
}, {
    timestamps: true
});

const Settings = (models.Settings as Model<ISettings>) || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;