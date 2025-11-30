import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';

const testimonials = [
  {
    content:
      'DesignKit has transformed how our team builds and maintains our design system. The automation features alone save us hours every week.',
    author: 'Sarah Chen',
    role: 'Design Systems Lead',
    company: 'TechCorp',
    avatar: 'SC',
  },
  {
    content:
      'The collaboration features are incredible. Our designers and developers are finally speaking the same language thanks to DesignKit.',
    author: 'Marcus Johnson',
    role: 'Frontend Lead',
    company: 'StartupXYZ',
    avatar: 'MJ',
  },
  {
    content:
      "We've been able to scale our design system across 15+ products seamlessly. The versioning and deployment features are game-changers.",
    author: 'Elena Rodriguez',
    role: 'Product Designer',
    company: 'Enterprise Inc',
    avatar: 'ER',
  },
  {
    content:
      "The AI-powered component generation is mind-blowing. It's like having a design systems expert working 24/7 for our team.",
    author: 'David Kim',
    role: 'CTO',
    company: 'InnovateLab',
    avatar: 'DK',
  },
  {
    content:
      'Integration with our existing tools was seamless. DesignKit fits perfectly into our workflow without any disruption.',
    author: 'Lisa Thompson',
    role: 'UX Director',
    company: 'DesignCo',
    avatar: 'LT',
  },
  {
    content:
      'The documentation auto-generation feature has made our component library so much more accessible to the entire organization.',
    author: 'Alex Rivera',
    role: 'Senior Developer',
    company: 'BuildFast',
    avatar: 'AR',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Loved by design teams worldwide
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            See what teams are saying about how DesignKit has transformed their design system
            workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <blockquote className="text-sm mb-4">"{testimonial.content}"</blockquote>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
