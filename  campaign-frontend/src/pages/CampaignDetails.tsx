import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { useCampaign } from '@/hooks/useCampaigns';
import { useQuery } from 'react-query';
import { useEffect } from 'react';
import { CampaignService } from '@/services/campaigns';

export const CampaignDetails = () => {
  const { url } = useParams();
  const decodedUrl = decodeURIComponent(url || '');
  const fullUrl = `https://${decodedUrl}`;
  
  const { data: campaign, isLoading } = useQuery(['campaign', fullUrl], 
    () => CampaignService.getCampaignByUrl(fullUrl)
  );

  useEffect(() => {
    if (campaign?.data?.title) {
      document.title = campaign.data.title;
    }
  }, [campaign]);

  const handlePrint = () => {
    const element = document.getElementById('campaign-details');
    html2pdf().from(element).save(`campaign-${campaign?.data?.title}.pdf`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div className="min-h-screen bg-background" id="campaign-details">
      {/* Hero Banner */}
      <div 
        className="w-full h-[300px] bg-gradient-to-r from-primary to-primary/60 relative"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-white">{campaign.title}</h1>
            <Badge 
              variant={campaign.data.is_running ? "success" : "destructive"}
              className="text-lg py-1 px-4"
            >
              {campaign.data.is_running ? "Active Campaign" : "Inactive Campaign"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{campaign.payouts.length}</div>
              <div className="text-muted-foreground">Active Payouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${campaign.payouts.reduce((sum, p) => sum + p.amount, 0)}
              </div>
              <div className="text-muted-foreground">Total Payout Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {campaign.payouts.length > 0 ? 
                  `$${(campaign.payouts.reduce((sum, p) => sum + p.amount, 0) / campaign.payouts.length).toFixed(2)}` : 
                  '$0'}
              </div>
              <div className="text-muted-foreground">Average Payout</div>
            </CardContent>
          </Card>
        </div>

        {/* Landing URL Card */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Landing Page</h2>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <a 
                href={campaign.landing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                {campaign.landing_url}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Payouts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {campaign.payouts.map((payout) => (
                <div 
                  key={payout.id}
                  className="p-4 rounded-lg bg-muted flex justify-between items-center"
                >
                  <span className="font-medium">{payout.country}</span>
                  <Badge variant="secondary">${payout.amount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;