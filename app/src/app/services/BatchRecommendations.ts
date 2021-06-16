import { Recommendation } from './Recommendation';

export interface BatchRecommendations {
    keyword: string;
    creator: string;
    list: Recommendation[];
}
