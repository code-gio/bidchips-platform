import { redirect } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({ parent }) => {

    // const { data: profiles } = await supabaseAdmin
    //     .from("profiles")
    //     .select("id, email, display_name, username, role, is_active, onboarding_completed, created_at, last_login_at, username, time_zone, avatar_url, address_street, address_city, address_state, address_zip, country, tagline, bio, language, birth_date, avatar_crop_x, avatar_crop_y, avatar_crop_scale, avatar_crop_size, avatar_image_width, avatar_image_height");


    // return {
    //     profiles,
    // }

    const parentData = await parent();
    return { ...parentData };


}