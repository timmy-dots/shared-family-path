import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "multiple-choice" | "scale";
  question: string;
  description?: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string];
}

const questions: Question[] = [
  {
    id: "fairness_equality",
    type: "multiple-choice",
    question: "When distributing family wealth, which principle matters most to you?",
    description: "Consider how inheritance should be handled among family members.",
    options: [
      "Equal distribution regardless of circumstances",
      "Fair distribution based on individual needs",
      "Merit-based distribution based on contributions",
      "A combination of equal and merit-based factors"
    ]
  },
  {
    id: "tradition_flexibility",
    type: "scale",
    question: "How important is maintaining family traditions versus adapting to change?",
    description: "Consider how your family should handle traditional practices and values.",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: ["Maintain traditions", "Embrace change"]
  },
  {
    id: "transparency_privacy",
    type: "multiple-choice",
    question: "How much financial information should be shared within the family?",
    description: "Think about transparency versus privacy in family financial matters.",
    options: [
      "Complete transparency - everyone knows everything",
      "Limited transparency - share major decisions only", 
      "Private matters - minimal sharing",
      "Depends on the type of information"
    ]
  },
  {
    id: "family_priority",
    type: "scale",
    question: "When making important decisions, how should we balance immediate vs. extended family?",
    description: "Consider who should be prioritized in family decision-making.",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: ["Immediate family first", "Include extended family equally"]
  },
  {
    id: "charitable_giving",
    type: "multiple-choice",
    question: "What role should charitable giving play in family wealth planning?",
    description: "Consider how philanthropy fits into your family's values.",
    options: [
      "Major priority - significant portion goes to charity",
      "Moderate priority - some charitable giving expected",
      "Minor priority - family comes first",
      "Individual choice - no family expectations"
    ]
  },
  {
    id: "decision_making",
    type: "multiple-choice",
    question: "How should major family decisions be made?",
    description: "Think about the decision-making process for important family matters.",
    options: [
      "Consensus - everyone must agree",
      "Democratic vote - majority rules", 
      "Delegate to family head/elders",
      "Expert consultation with family input"
    ]
  }
];

export default function DiscoverValues() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const familyId = searchParams.get("family_id");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setPageSEO(
      "Discover Your Family Values - Vault",
      "Take our questionnaire to explore shared principles and priorities around inheritance and family governance."
    );

    // Load saved answers from localStorage
    const savedAnswers = localStorage.getItem("valuesQuestionnaire");
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error("Error loading saved answers:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save answers to localStorage whenever they change
    localStorage.setItem("valuesQuestionnaire", JSON.stringify(answers));
  }, [answers]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSaveResults = async () => {
    if (!user) {
      // Redirect to auth page to sign up/login
      navigate("/auth?mode=signup&redirect=/discover-values");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("values_questionnaire")
        .upsert({
          user_id: user.id,
          family_id: familyId,
          responses: answers
        });

      if (error) throw error;

      // Clear localStorage after successful save
      localStorage.removeItem("valuesQuestionnaire");
      
      toast({
        title: "Results saved successfully!",
        description: "Your values questionnaire has been saved to your account."
      });

      // Redirect to dashboard or family channel
      navigate("/account");
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error saving results",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Values Summary</CardTitle>
              <CardDescription>
                Thank you for completing the questionnaire! Here's what we learned about your family values.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(answers).map(([questionId, answer]) => {
                  const question = questions.find(q => q.id === questionId);
                  if (!question) return null;

                  return (
                    <div key={questionId} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        {question.question}
                      </h4>
                      <p className="text-foreground">
                        {question.type === "multiple-choice" 
                          ? question.options?.[answer] || answer
                          : `${answer}/10 - ${answer <= 5 ? question.scaleLabels?.[0] : question.scaleLabels?.[1]}`
                        }
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  onClick={handleSaveResults} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Saving..." : user ? "Save My Results" : "Sign Up to Save Results"}
                </Button>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Create an account to save your results and compare with family members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
            {question.description && (
              <CardDescription className="text-base">
                {question.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {question.type === "multiple-choice" && question.options && (
              <RadioGroup
                value={currentAnswer?.toString() || ""}
                onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === "scale" && (
              <div className="space-y-6">
                <div className="px-2">
                  <Slider
                    value={[currentAnswer || 5]}
                    onValueChange={(value) => handleAnswer(question.id, value[0])}
                    max={question.scaleMax || 10}
                    min={question.scaleMin || 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{question.scaleLabels?.[0]}</span>
                    <span className="font-medium">
                      {currentAnswer || 5}/{question.scaleMax || 10}
                    </span>
                    <span>{question.scaleLabels?.[1]}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={currentAnswer === undefined || currentAnswer === null}
              >
                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentQuestion === 0 && (
          <Card className="mt-8 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-primary">Welcome to Values Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  This questionnaire helps identify shared principles and priorities around inheritance, 
                  family governance, and decision-making. Your responses will help create a foundation 
                  for meaningful family conversations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}