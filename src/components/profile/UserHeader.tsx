'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface UserHeaderProps {
    name: string;
    avatarUrl: string;
    level: string;
}

export default function UserHeader({ name, avatarUrl, level }: UserHeaderProps) {
    return (
        <div id="user-header-profile" className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={avatarUrl || '/images/avatar.jpg'} alt={name} />
                <AvatarFallback>{name ? name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold font-headline">{name || 'Usuário'}</h2>
                <Badge variant="outline" className="mt-1 border-primary/50 text-primary gap-1.5 pl-2">
                    <Award className="w-3.5 h-3.5" />
                    <span className="font-semibold">{level}</span>
                </Badge>
            </div>
        </div>
    )
}
