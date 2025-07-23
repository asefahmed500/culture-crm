
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IStory extends Document {
  title: string;
  narrative: string;
  keyDataPoints: string[];
  recommendation: string;
  createdAt: Date;
}

const StorySchema: Schema<IStory> = new Schema({
  title: { type: String, required: true },
  narrative: { type: String, required: true },
  keyDataPoints: { type: [String], required: true },
  recommendation: { type: String, required: true },
}, {
    timestamps: true
});

const Story = (models.Story as Model<IStory>) || mongoose.model<IStory>('Story', StorySchema);
export default Story;
