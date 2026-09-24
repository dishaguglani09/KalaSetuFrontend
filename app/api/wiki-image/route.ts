import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return new NextResponse('Missing query', { status: 400 });
  }

  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { next: { revalidate: 86400 } } // Cache at the edge for 24 hours
    );
    
    if (!res.ok) throw new Error('Wikipedia API failed');
    
    const data = await res.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const page = Object.values(pages)[0] as any;
      if (page && page.thumbnail && page.thumbnail.source) {
        // Fetch the actual image binary to avoid cross-origin redirect issues in SVG <image>
        const imgRes = await fetch(page.thumbnail.source);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': imgRes.headers.get('Content-Type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
    }
    
    // No image found on Wikipedia
    return new NextResponse('Not found', { status: 404 });
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
