import { supabase } from '../lib/supabase';
import { Character, Placement } from '../types';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Composition {
  id: string;
  project_id: string;
  background_image_url: string;
  layout_guide_url?: string;
  generated_image_url?: string;
  upscaled_image_url?: string;
  created_at: string;
}

export const createProject = async (name: string = 'Untitled Project'): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name })
    .select()
    .maybeSingle();

  if (error) throw new Error(`Failed to create project: ${error.message}`);
  if (!data) throw new Error('No data returned from project creation');

  return data;
};

export const getRecentProjects = async (limit: number = 10): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch projects: ${error.message}`);

  return data || [];
};

export const saveComposition = async (
  projectId: string,
  backgroundImageUrl: string,
  layoutGuideUrl?: string,
  generatedImageUrl?: string,
  upscaledImageUrl?: string
): Promise<Composition> => {
  const { data, error } = await supabase
    .from('compositions')
    .insert({
      project_id: projectId,
      background_image_url: backgroundImageUrl,
      layout_guide_url: layoutGuideUrl,
      generated_image_url: generatedImageUrl,
      upscaled_image_url: upscaledImageUrl
    })
    .select()
    .maybeSingle();

  if (error) throw new Error(`Failed to save composition: ${error.message}`);
  if (!data) throw new Error('No data returned from composition save');

  return data;
};

export const saveCharacters = async (
  compositionId: string,
  characters: Character[],
  placements: Placement[]
): Promise<void> => {
  const characterRecords = characters.map((char, index) => {
    const placement = placements.find(p => p.characterId === char.id);

    return {
      composition_id: compositionId,
      image_url: char.image,
      art_style: char.style,
      position_x: placement?.box.x || 0,
      position_y: placement?.box.y || 0,
      width: placement?.box.width || 100,
      height: placement?.box.height || 100,
      action: placement?.action || '',
      order_index: index
    };
  });

  const { error } = await supabase
    .from('characters')
    .insert(characterRecords);

  if (error) throw new Error(`Failed to save characters: ${error.message}`);
};

export const getCompositionsByProject = async (projectId: string): Promise<Composition[]> => {
  const { data, error } = await supabase
    .from('compositions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch compositions: ${error.message}`);

  return data || [];
};
