import { redirect } from 'next/navigation';

export default function CourseIdRedirect({ params }: { params: { courseId: string } }) {
  // If user visits /courses/c-analog-001 or any slug, redirect to canonical /courses/analog-electronic-circuits
  redirect('/courses/analog-electronic-circuits');
}
