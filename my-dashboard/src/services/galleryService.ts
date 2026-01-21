import api from "../api/axios";

export interface SectionResponse {
    id: number;
    name: string;
    is_active: boolean;
    items_count: number;
}

export const createSections = async (
    sections: { name: string; is_active: boolean }[],
): Promise<SectionResponse[]> => {
    const res = await api.post("/gallery-sections", { sections });
    if (!res.data) throw new Error("No data returned from API");
    return res.data;
};

export const getSections = async (): Promise<SectionResponse[]> => {
    const res = await api.get("/gallery-sections");
    if (!res.data) throw new Error("No data returned from API");
    return res.data;
};

export const getSectionItems = async (sectionId: number) => {
    const response = await api.get(`/gallery-sections/${sectionId}/items`);
    return response.data;
};
