import { useEffect, useState } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, TrendingUp } from "lucide-react";

interface ValuesResponse {
  id: string;
  user_id: string;
  responses: any;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface ChartData {
  category: string;
  user: number;
  family_avg: number;
}

const questionCategories = {
  fairness_equality: "Fairness vs Equality",
  tradition_flexibility: "Tradition vs Flexibility", 
  transparency_privacy: "Transparency",
  family_priority: "Family Priority",
  charitable_giving: "Charitable Giving",
  decision_making: "Decision Making"
};

export default function ValuesComparison() {
  const [userResponses, setUserResponses] = useState<ValuesResponse | null>(null);
  const [familyResponses, setFamilyResponses] = useState<ValuesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setPageSEO("Values Comparison - Vault", "Compare your family values and see where you align on key decisions.");
    if (user) {
      fetchValuesData();
    }
  }, [user]);

  const fetchValuesData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get user's responses
      const { data: userResponse, error: userError } = await supabase
        .from("values_questionnaire")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError) throw userError;
      setUserResponses(userResponse);

      // Get family responses if user has a family
      if (userResponse?.family_id) {
        const { data: familyData, error: familyError } = await supabase
          .from("values_questionnaire")
          .select("*")
          .eq("family_id", userResponse.family_id)
          .neq("user_id", user.id);

        if (familyError) throw familyError;
        setFamilyResponses(familyData || []);
      }
    } catch (error) {
      console.error("Error fetching values data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load values comparison data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeResponse = (questionId: string, response: any): number => {
    // Convert all responses to a 0-100 scale for comparison
    switch (questionId) {
      case "fairness_equality":
      case "transparency_privacy":
      case "charitable_giving":
      case "decision_making":
        // Multiple choice: convert to percentage based on option index
        return (response / 3) * 100;
      case "tradition_flexibility":
      case "family_priority":
        // Scale 1-10: convert to percentage
        return (response / 10) * 100;
      default:
        return 0;
    }
  };

  const generateChartData = (): ChartData[] => {
    if (!userResponses) return [];

    return Object.entries(questionCategories).map(([questionId, category]) => {
      const userValue = normalizeResponse(questionId, userResponses.responses[questionId] || 0);
      
      // Calculate family average
      const familyValues = familyResponses
        .map(resp => normalizeResponse(questionId, resp.responses[questionId] || 0))
        .filter(val => val > 0);
      
      const familyAvg = familyValues.length > 0 
        ? familyValues.reduce((sum, val) => sum + val, 0) / familyValues.length
        : userValue;

      return {
        category,
        user: Math.round(userValue),
        family_avg: Math.round(familyAvg)
      };
    });
  };

  const generateRadarData = () => {
    const chartData = generateChartData();
    return chartData.map(item => ({
      subject: item.category,
      A: item.user,
      B: selectedMember ? 
        (() => {
          const memberData = familyResponses.find(r => r.user_id === selectedMember);
          if (!memberData) return item.user;
          
          const questionId = Object.keys(questionCategories).find(k => 
            questionCategories[k as keyof typeof questionCategories] === item.category
          );
          
          return questionId ? Math.round(normalizeResponse(questionId, memberData.responses[questionId] || 0)) : item.user;
        })()
        : item.family_avg,
      fullMark: 100,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your values comparison...</p>
        </div>
      </div>
    );
  }

  if (!userResponses) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Values Data Found</CardTitle>
            <CardDescription>
              You haven't completed the values questionnaire yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = "/discover-values"}>
              Take Values Questionnaire
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = generateChartData();
  const radarData = generateRadarData();

  return (
    <div className="container mx-auto py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Values Comparison</h1>
        <p className="text-muted-foreground mt-2">
          See how your values align with your family members
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Family Members</p>
                <p className="text-2xl font-bold">{familyResponses.length + 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Responses Complete</p>
                <p className="text-2xl font-bold">{familyResponses.length + 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium">Average Alignment</p>
              <p className="text-2xl font-bold text-primary">
                {Math.round(chartData.reduce((sum, item) => 
                  sum + (100 - Math.abs(item.user - item.family_avg)), 0
                ) / chartData.length)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Individual Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Values Alignment</CardTitle>
                <CardDescription>
                  Your responses vs family average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="user" fill="hsl(var(--primary))" name="You" />
                    <Bar dataKey="family_avg" fill="hsl(var(--primary) / 0.6)" name="Family Average" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Values Radar</CardTitle>
                <CardDescription>
                  Visual representation of your family values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={10} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                    <Radar
                      name="You"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Family Average"
                      dataKey="B"
                      stroke="hsl(var(--primary) / 0.6)"
                      fill="hsl(var(--primary) / 0.6)"
                      fillOpacity={0.1}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compare with Family Members</CardTitle>
              <CardDescription>
                Select a family member to see detailed comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedMember === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    Family Average
                  </Button>
                  {familyResponses.map((response) => (
                    <Button
                      key={response.user_id}
                      variant={selectedMember === response.user_id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMember(response.user_id)}
                    >
                      {`Member ${response.user_id.slice(0, 8)}`}
                    </Button>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={12} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                    <Radar
                      name="You"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name={selectedMember ? "Selected Member" : "Family Average"}
                      dataKey="B"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Your Individual Responses</CardTitle>
          <CardDescription>
            Detailed breakdown of your questionnaire answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(questionCategories).map(([questionId, category]) => {
              const response = userResponses.responses[questionId];
              return (
                <div key={questionId} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{category}</h4>
                    <Badge variant="secondary">
                      {normalizeResponse(questionId, response)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Response: {typeof response === 'number' && questionId.includes('scale') 
                      ? `${response}/10` 
                      : `Option ${response + 1}`
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}