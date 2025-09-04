import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager';
import { SurveysManager } from '@/components/admin/SurveysManager';
import { FacultyManager } from '@/components/admin/FacultyManager';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import FrameManager from '@/components/admin/FrameManager';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('announcements');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Paneli</h1>
          <p className="text-muted-foreground">Sistem yönetimi ve içerik düzenleme</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="announcements">Duyurular</TabsTrigger>
            <TabsTrigger value="surveys">Anketler</TabsTrigger>
            <TabsTrigger value="faculty">Öğretim Üyeleri</TabsTrigger>
            <TabsTrigger value="schedule">Ders Programı</TabsTrigger>
            <TabsTrigger value="frames">Çerçeveler</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsManager />
          </TabsContent>

          <TabsContent value="surveys" className="space-y-4">
            <SurveysManager />
          </TabsContent>

          <TabsContent value="faculty" className="space-y-4">
            <FacultyManager />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="frames" className="space-y-4">
            <FrameManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;